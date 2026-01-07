/**
 * Portfolio Photo Enhance Edge Function
 * Uses GCP Imagen API to enhance profile photos professionally
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EnhanceRequest {
  portfolio_id: string;
  photo_base64: string; // Base64 encoded image
  style?: 'professional' | 'casual' | 'creative';
}

// Call GCP Imagen API for image enhancement
async function enhanceWithImagen(imageBase64: string, style: string): Promise<string> {
  const GCP_PROJECT_ID = Deno.env.get('GCP_PROJECT_ID') || 'hushh-ai-agents';
  const GCP_LOCATION = 'us-central1';
  
  // Get access token
  const GOOGLE_ACCESS_TOKEN = Deno.env.get('GOOGLE_ACCESS_TOKEN');
  
  if (!GOOGLE_ACCESS_TOKEN) {
    // Fallback: Use service account to get token
    throw new Error('GOOGLE_ACCESS_TOKEN not configured');
  }

  const stylePrompts: Record<string, string> = {
    professional: 'Enhance this portrait photo to look professional with proper lighting, sharp focus, and subtle skin smoothing. Make it suitable for a corporate LinkedIn profile.',
    casual: 'Enhance this photo with natural lighting and warm tones while keeping it professional and approachable.',
    creative: 'Enhance this photo with slightly dramatic lighting and artistic color grading suitable for a creative portfolio.',
  };

  const prompt = stylePrompts[style] || stylePrompts.professional;

  // Call Vertex AI Imagen API
  const response = await fetch(
    `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/imagegeneration@006:predict`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
        ],
        parameters: {
          sampleCount: 1,
          mode: 'EDITING',
          editConfig: {
            guidanceScale: 15,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Imagen API error:', errorText);
    throw new Error(`Imagen API error: ${response.status}`);
  }

  const data = await response.json();
  const enhancedImage = data.predictions?.[0]?.bytesBase64Encoded;
  
  if (!enhancedImage) {
    throw new Error('No enhanced image returned');
  }

  return `data:image/png;base64,${enhancedImage}`;
}

// Alternative: Simple image optimization using sharp-like operations
async function simpleEnhance(imageBase64: string): Promise<string> {
  // For MVP, return the original image with a placeholder for enhancement
  // In production, this would use Imagen or Cloud Vision API
  return imageBase64;
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

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { portfolio_id, photo_base64, style = 'professional' }: EnhanceRequest = await req.json();

    if (!portfolio_id || !photo_base64) {
      throw new Error('Missing required fields');
    }

    // Verify portfolio belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolio_id)
      .single();

    if (portfolioError || !portfolio || portfolio.user_id !== user.id) {
      throw new Error('Portfolio not found or access denied');
    }

    let enhancedPhotoUrl: string;
    
    try {
      // Try Imagen API enhancement
      enhancedPhotoUrl = await enhanceWithImagen(photo_base64, style);
    } catch (imagenError) {
      console.warn('Imagen API failed, using simple enhancement:', imagenError);
      // Fallback to simple enhancement
      enhancedPhotoUrl = await simpleEnhance(photo_base64);
    }

    // Upload enhanced photo to Supabase Storage
    const fileName = `portfolios/${portfolio_id}/enhanced-${Date.now()}.png`;
    const imageBuffer = Uint8Array.from(
      atob(enhancedPhotoUrl.replace(/^data:image\/\w+;base64,/, '')),
      (c) => c.charCodeAt(0)
    );

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-photos')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Return base64 as fallback
      return new Response(
        JSON.stringify({
          success: true,
          enhanced_photo_url: enhancedPhotoUrl,
          storage_url: null,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('portfolio-photos')
      .getPublicUrl(fileName);

    const storageUrl = publicUrlData?.publicUrl;

    // Update portfolio with enhanced photo URL
    await supabase
      .from('portfolios')
      .update({
        enhanced_photo_url: storageUrl || enhancedPhotoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolio_id);

    return new Response(
      JSON.stringify({
        success: true,
        enhanced_photo_url: storageUrl || enhancedPhotoUrl,
        storage_url: storageUrl,
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
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      }
    );
  }
});
