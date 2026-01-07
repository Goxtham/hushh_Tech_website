/**
 * Portfolio Generate Edge Function
 * Uses GCP Vertex AI Gemini 1.5 Pro to generate portfolio content from interview answers
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InterviewAnswer {
  question_id: number;
  question_text: string;
  answer: string;
}

interface GenerateRequest {
  portfolio_id: string;
  interview_answers: InterviewAnswer[];
  name: string;
}

interface GeneratedContent {
  headline: string;
  bio: string;
  tagline: string;
  skills: string[];
  experience_summary: string;
}

// GCP Vertex AI Gemini API
async function callGemini(prompt: string): Promise<string> {
  const GCP_PROJECT_ID = Deno.env.get('GCP_PROJECT_ID') || 'hushh-ai-agents';
  const GCP_LOCATION = 'us-central1';
  const MODEL_ID = 'gemini-1.5-pro';
  
  // Get access token from service account
  const serviceAccountKey = JSON.parse(Deno.env.get('GCP_SERVICE_ACCOUNT_KEY') || '{}');
  
  // Create JWT for authentication
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccountKey.client_email,
    sub: serviceAccountKey.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  // For simplicity, use fetch to call Gemini via REST API with API key
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (GEMINI_API_KEY) {
    // Use Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  throw new Error('GEMINI_API_KEY not configured');
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

    const { portfolio_id, interview_answers, name }: GenerateRequest = await req.json();

    if (!portfolio_id || !interview_answers || interview_answers.length === 0) {
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

    // Build context from interview answers
    const answersContext = interview_answers
      .map((a) => `Q: ${a.question_text}\nA: ${a.answer}`)
      .join('\n\n');

    // Create prompt for Gemini
    const prompt = `You are a professional portfolio content writer. Based on the following interview answers, generate compelling portfolio content for ${name}.

Interview Answers:
${answersContext}

Generate the following content in JSON format:
{
  "headline": "A professional headline (max 100 chars) that captures their role and expertise",
  "bio": "A compelling professional bio (150-250 words) that tells their story",
  "tagline": "A catchy tagline (max 80 chars) that captures their professional essence",
  "skills": ["Array of 5-8 key skills extracted from their answers"],
  "experience_summary": "A brief summary of their experience (2-3 sentences)"
}

Important:
- Be professional but personable
- Highlight their unique strengths
- Use active voice
- Make it engaging for potential employers/clients
- Return ONLY valid JSON, no markdown or extra text`;

    // Call Gemini API
    const aiResponse = await callGemini(prompt);
    
    // Parse JSON response
    let generatedContent: GeneratedContent;
    try {
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      generatedContent = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback content
      generatedContent = {
        headline: `${name} | Professional`,
        bio: `A dedicated professional with expertise in their field.`,
        tagline: 'Building the future, one project at a time',
        skills: ['Leadership', 'Communication', 'Problem Solving'],
        experience_summary: 'Experienced professional with a track record of success.',
      };
    }

    // Update portfolio with generated content
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        headline: generatedContent.headline,
        bio: generatedContent.bio,
        tagline: generatedContent.tagline,
        wizard_step: 6, // Move to preview step
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolio_id);

    if (updateError) {
      console.error('Failed to update portfolio:', updateError);
    }

    // Save interview answers
    for (const answer of interview_answers) {
      await supabase
        .from('portfolio_interview')
        .upsert({
          portfolio_id,
          question_id: answer.question_id,
          question_text: answer.question_text,
          answer_text: answer.answer,
          ai_processed: true,
        }, {
          onConflict: 'portfolio_id,question_id',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
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
