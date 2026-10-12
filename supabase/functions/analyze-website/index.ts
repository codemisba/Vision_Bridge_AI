import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const payload = body ? JSON.parse(body) : {};
    const { websiteUrl, targetLanguage } = payload;
    if (!websiteUrl) {
      return new Response(JSON.stringify({ error: 'Website URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) { throw new Error('LOVABLE_API_KEY is not configured'); }

    console.log('Fetching website:', websiteUrl);
    let websiteContent = '';
    try {
      const response = await fetch(websiteUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      websiteContent = await response.text();
      websiteContent = websiteContent.substring(0, 15000);
    } catch (fetchError) {
      console.error('Error fetching website:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch website. Please check the URL and try again.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Helper to post to the LOVABLE AI gateway with robust parsing
    async function postAI(payload: any) {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      try {
        return { ok: res.ok, json: JSON.parse(text), text };
      } catch {
        return { ok: res.ok, json: null, text };
      }
    }

    console.log('Analyzing website content...');
    const analysisPayload = {
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a website analyzer. Analyze the provided HTML content and provide a clear, concise summary of:\n1. What the website is about\n2. Main features and functionality\n3. Target audience\n4. Key sections/pages available\n\nKeep the summary informative but concise (200-300 words). Format with bullet points for readability. Respond only with the summary (no explanations about your role).`,
        },
        { role: 'user', content: `Analyze this website (URL: ${websiteUrl}):\n\n${websiteContent}` },
      ],
    };

    const analysisResponse = await postAI(analysisPayload);
    if (!analysisResponse.ok) {
      console.error('AI analysis error:', analysisResponse.text || analysisResponse.json);
      throw new Error('Failed to analyze website');
    }
    const analysisData = analysisResponse.json;
    const englishAnalysis = analysisData?.choices?.[0]?.message?.content || analysisResponse.text || 'Unable to analyze website';

    console.log('Website analyzed successfully');
    let translatedAnalysis = englishAnalysis;

    if (targetLanguage && targetLanguage !== 'en') {
      console.log('Translating to:', targetLanguage);
      const languageNames: Record<string, string> = {
        'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
        'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese (Simplified)',
        'ar': 'Arabic', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu', 'mr': 'Marathi',
        'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'ur': 'Urdu',
      };

      // Strong translator prompt: respond ONLY with the translated text, preserving bullet formatting
      const translationPayload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: `You are a professional translator. Translate the following text exactly to ${languageNames[targetLanguage] || targetLanguage}. Preserve formatting (bullet points, line breaks) and respond ONLY with the translated text. Do not add commentary or explanations.` },
          { role: 'user', content: englishAnalysis }
        ],
      };

      const translationResponse = await postAI(translationPayload);
      if (translationResponse.ok) {
        const translationData = translationResponse.json;
        translatedAnalysis = translationData?.choices?.[0]?.message?.content || translationResponse.text || englishAnalysis;
        console.log('Translation completed');
      } else {
        console.warn('Translation failed, returning English analysis');
      }
    }

    return new Response(JSON.stringify({ englishAnalysis, translatedAnalysis, targetLanguage, websiteUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in analyze-website:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
