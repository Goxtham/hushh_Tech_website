// MCP Agent Card Endpoint - Returns agent data in MCP-compatible JSON format
// Supports: GET /mcp-agent-card?id=<agent_id> or GET /mcp-agent-card?slug=<agent_slug>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('id');
    const agentSlug = url.searchParams.get('slug');

    // List all agents if no id/slug provided
    if (!agentId && !agentSlug) {
      const { data: agents, error } = await supabase
        .from('kirkland_agents')
        .select('id, name, alias, city, state, categories, photo_url, avg_rating, is_closed')
        .eq('is_closed', false)
        .order('name');

      if (error) throw error;

      const agentCards = (agents || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.categories?.length ? a.categories.join(', ') : 'Hushh AI Agent',
        url: `https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/mcp-agent-card?id=${a.id}`,
        provider: { organization: 'Hushh Labs', url: 'https://hushh.ai' },
        location: a.city && a.state ? `${a.city}, ${a.state}` : null,
      }));

      return new Response(JSON.stringify({ agents: agentCards, count: agentCards.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch single agent
    let query = supabase.from('kirkland_agents').select('*');
    if (agentId) query = query.eq('id', agentId);
    else if (agentSlug) query = query.eq('slug', agentSlug);

    const { data: agent, error } = await query.single();

    if (error || !agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build skills from categories
    const skills = (agent.categories || []).map((cat: string) => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      name: cat,
      description: `Expert in ${cat}`,
    }));

    const agentCard = {
      name: agent.name,
      description: agent.categories?.length ? agent.categories.join(', ') : 'Hushh AI Agent',
      url: `https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/mcp-agent-card?id=${agent.id}`,
      provider: {
        organization: 'Hushh Labs',
        url: 'https://hushh.ai',
      },
      version: '1.0.0',
      capabilities: {
        streaming: true,
        pushNotifications: false,
        stateTransitionHistory: false,
      },
      skills,
      defaultInputModes: ['text'],
      defaultOutputModes: ['text'],
      metadata: {
        agentId: agent.id,
        alias: agent.alias || null,
        location: agent.city && agent.state ? `${agent.city}, ${agent.state}` : null,
        avgRating: agent.avg_rating || null,
        reviewCount: agent.review_count || 0,
        photoUrl: agent.photo_url || null,
        isClosed: agent.is_closed || false,
      },
      links: [
        { type: 'website', url: 'https://hushh.ai' },
        { type: 'chat', url: `https://hushhtech.com/hushh-agents/agent/${agent.id}/chat` },
      ],
    };

    return new Response(JSON.stringify(agentCard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
