/**
 * Portfolio Slug Check Edge Function
 * Checks if a portfolio slug is available for use
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SlugCheckRequest {
  slug: string;
  portfolio_id?: string; // Optional - exclude this portfolio when checking
}

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
  'admin',
  'api',
  'app',
  'auth',
  'blog',
  'dashboard',
  'help',
  'hushh',
  'login',
  'logout',
  'portfolio',
  'portfolios',
  'profile',
  'settings',
  'signup',
  'support',
  'user',
  'users',
];

// Validate slug format
function isValidSlugFormat(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }

  if (slug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters' };
  }

  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be 50 characters or less' };
  }

  // Only allow lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  // Cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  // Cannot have consecutive hyphens
  if (/--/.test(slug)) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  return { valid: true };
}

// Generate slug suggestions based on a name
function generateSlugSuggestions(name: string, existingSlugs: string[]): string[] {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);

  const suggestions: string[] = [];
  
  // Try base slug first
  if (!existingSlugs.includes(baseSlug) && !RESERVED_SLUGS.includes(baseSlug)) {
    suggestions.push(baseSlug);
  }

  // Add number suffixes
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${baseSlug}-${i}`;
    if (!existingSlugs.includes(suggestion) && !RESERVED_SLUGS.includes(suggestion)) {
      suggestions.push(suggestion);
    }
    if (suggestions.length >= 3) break;
  }

  // Add year suffix
  const year = new Date().getFullYear();
  const yearSlug = `${baseSlug}-${year}`;
  if (!existingSlugs.includes(yearSlug) && !RESERVED_SLUGS.includes(yearSlug) && suggestions.length < 3) {
    suggestions.push(yearSlug);
  }

  // Add "portfolio" suffix
  const portfolioSlug = `${baseSlug}-portfolio`;
  if (!existingSlugs.includes(portfolioSlug) && !RESERVED_SLUGS.includes(portfolioSlug) && suggestions.length < 3) {
    suggestions.push(portfolioSlug);
  }

  return suggestions.slice(0, 3);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { slug, portfolio_id }: SlugCheckRequest = await req.json();

    // Validate format first
    const formatCheck = isValidSlugFormat(slug);
    if (!formatCheck.valid) {
      return new Response(
        JSON.stringify({
          available: false,
          error: formatCheck.error,
          suggestions: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check if reserved
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      // Get similar slugs to provide suggestions
      const { data: similarPortfolios } = await supabase
        .from('portfolios')
        .select('slug')
        .ilike('slug', `${slug}%`)
        .limit(10);

      const existingSlugs = similarPortfolios?.map((p) => p.slug) || [];
      const suggestions = generateSlugSuggestions(slug, existingSlugs);

      return new Response(
        JSON.stringify({
          available: false,
          error: 'This URL is reserved. Please choose a different one.',
          suggestions,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check database for existing slug
    let query = supabase
      .from('portfolios')
      .select('id, slug')
      .eq('slug', slug.toLowerCase());

    // Exclude current portfolio if updating
    if (portfolio_id) {
      query = query.neq('id', portfolio_id);
    }

    const { data: existingPortfolio, error: queryError } = await query.single();

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (slug is available)
      console.error('Database query error:', queryError);
      throw new Error('Database error while checking slug');
    }

    if (existingPortfolio) {
      // Slug is taken, provide suggestions
      const { data: similarPortfolios } = await supabase
        .from('portfolios')
        .select('slug')
        .ilike('slug', `${slug}%`)
        .limit(10);

      const existingSlugs = similarPortfolios?.map((p) => p.slug) || [];
      existingSlugs.push(slug); // Include the taken slug
      const suggestions = generateSlugSuggestions(slug, existingSlugs);

      return new Response(
        JSON.stringify({
          available: false,
          error: 'This URL is already taken',
          suggestions,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Slug is available!
    return new Response(
      JSON.stringify({
        available: true,
        slug: slug.toLowerCase(),
        preview_url: `https://folio.hushh.ai/${slug.toLowerCase()}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
