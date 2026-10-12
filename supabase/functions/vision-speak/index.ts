// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_CODES: Record<string, string> = {
  "English": "en", 
  "Hindi": "hi", 
  "Telugu": "te", 
  "Tamil": "ta", 
  "Kannada": "kn", 
  "Malayalam": "ml",
  "French": "fr",
  "Français": "fr",
  "Japanese": "ja",
  "日本語": "ja"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Helper to perform fetch with retries on 429/rate-limit and server errors.
  async function fetchWithRetries(url: string, options: any, maxRetries = 3) {
    let attempt = 0;
    while (true) {
      let res: Response;
      try {
        res = await fetch(url, options);
      } catch (networkErr) {
        if (attempt >= maxRetries - 1) throw networkErr;
        const backoff = 500 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, backoff));
        attempt++;
        continue;
      }

      if (res.ok) return res;

      const status = res.status;
      const retryAfter = res.headers.get ? res.headers.get('Retry-After') : null;
      const shouldRetry = status === 429 || status >= 500;

      if (shouldRetry && attempt < maxRetries - 1) {
        let wait = 500 * Math.pow(2, attempt);
        if (retryAfter) {
          const ra = parseInt(retryAfter, 10);
          if (!Number.isNaN(ra)) wait = ra * 1000;
        }
        await new Promise(r => setTimeout(r, wait));
        attempt++;
        continue;
      }

      const text = await res.text().catch(() => `HTTP ${status}`);
      throw new Error(`HTTP ${status}: ${text}`);
    }
  }

  try {
    const body = await req.json() as { imageBase64?: string; textContent?: string; language: string; mimeType?: string };
    const { imageBase64, textContent, language, mimeType } = body;
    const LOVABLE_API_KEY = (globalThis as any).Deno?.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("❌ LOVABLE_API_KEY is not configured in Supabase Edge Function secrets");
      throw new Error("LOVABLE_API_KEY environment variable is not set. Please configure it in Supabase Edge Function secrets.");
    }

    console.log("Processing request for language:", language);
    let originalText = "";

    // Step 1: Image Captioning with Gemini AI
    if (imageBase64) {
      // Primary caption request: prefer extracting any readable text first, then a short description.
      const captionResponse = await fetchWithRetries("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${LOVABLE_API_KEY}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an image captioning assistant. If the image contains legible written text, first output the exact extracted text prefixed with 'EXTRACTED_TEXT: ' (no extra commentary). After that, provide a concise 2-4 sentence description of the image suitable for visually impaired users. If there is no readable text, just provide the 2-4 sentence description."
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Analyze the attached image and follow the instructions from system: extract readable text (if any) and then give a concise description (2-4 sentences)."
                },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: `data:${mimeType};base64,${imageBase64}` 
                  } 
                }
              ]
            }
          ],
        }),
      });

      if (!captionResponse.ok) {
        throw new Error(`Gemini API error: ${captionResponse.status}`);
      }

      const captionData = await captionResponse.json();
      originalText = captionData.choices?.[0]?.message?.content || "";

      // If the model failed to produce a caption or returned an unhelpful result, try a targeted text-extraction request.
      if (!originalText || originalText.trim().length < 10 || /unable to generate caption/i.test(originalText)) {
        try {
          const extractResp = await fetchWithRetries("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: "You are a text extraction assistant. Extract ONLY the readable text from the provided image and return ONLY that text. Do not add labels or commentary. If no readable text is present, return an empty string."
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Extract any readable text from the attached image and return only that text." },
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
                  ]
                }
              ]
            })
          });

          if (extractResp.ok) {
            const extractData = await extractResp.json();
            const extracted = extractData.choices?.[0]?.message?.content || '';
            if (extracted && extracted.trim().length > 0) {
              // Use extracted text as the originalText so downstream translation and TTS use it.
              originalText = extracted.trim();
            }
          }
        } catch (e) {
          console.warn('Text-extraction fallback failed:', e);
        }
      }
    } else if (textContent) {
      originalText = textContent;
    } else {
      throw new Error("Either imageBase64 or textContent must be provided");
    }

    // Step 2: Translation (if not English)
    let translatedText = originalText;
    const langCode = LANGUAGE_CODES[language] || "en";
    
    console.log(`Language: ${language}, Lang Code: ${langCode}`);
    
    // Map language codes to full language codes with region for TTS
    const langCodeToFullCode: Record<string, string> = {
      "en": "en-US",
      "hi": "hi-IN",
      "te": "te-IN",
      "ta": "ta-IN",
      "kn": "kn-IN",
      "ml": "ml-IN",
      "fr": "fr-FR",
      "ja": "ja-JP"
    };
    
    const fullLangCode = langCodeToFullCode[langCode] || "en-US";

    if (langCode !== "en") {
      try {
        console.log(`Starting translation to ${language} (${langCode})...`);
        
        // Get language name for translation prompt
        const languageNameMap: Record<string, string> = {
          "hi": "Hindi",
          "te": "Telugu",
          "ta": "Tamil",
          "kn": "Kannada",
          "ml": "Malayalam",
          "fr": "French",
          "ja": "Japanese"
        };
        
        const targetLang = languageNameMap[langCode] || language;
        
        const translateResponse = await fetchWithRetries("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${LOVABLE_API_KEY}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: `You are a professional translator. Your task is to translate text to ${targetLang}. Respond ONLY with the translated text in ${targetLang} script. No explanations, no notes, only the translation.` 
              },
              { 
                role: "user", 
                content: `Translate this to ${targetLang}: ${originalText}` 
              },
            ],
          }),
        });

        console.log(`Translation API response status: ${translateResponse.status}`);

        if (!translateResponse.ok) {
          const errorText = await translateResponse.text();
          console.error("Translation API error response:", errorText);
          throw new Error(`Translation API error: ${translateResponse.status}`);
        }

        const translateData = await translateResponse.json();
        console.log("Translation response data:", JSON.stringify(translateData));
        
        const translatedContent = translateData.choices?.[0]?.message?.content;

        if (translatedContent && translatedContent.trim().length > 0) {
          translatedText = translatedContent.trim();
          console.log(`✅ Successfully translated to ${language}: ${translatedText.substring(0, 50)}...`);
        } else {
          console.warn(`⚠️ Translation returned empty content for ${language}`);
          translatedText = originalText;
        }

        // If the AI translation is identical to the original (or seems empty), fall back to LibreTranslate
        try {
          if (translatedText && translatedText.trim().length > 0 && translatedText.trim().toLowerCase() === originalText.trim().toLowerCase()) {
            console.log('AI translation equals original text — attempting LibreTranslate fallback');
            try {
              const libreResp = await fetchWithRetries('https://libretranslate.de/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: originalText, source: 'auto', target: langCode, format: 'text' })
              });
              if (libreResp.ok) {
                const libData = await libreResp.json();
                const libTranslated = libData.translatedText || libData.translated || '';
                if (libTranslated && libTranslated.trim().length > 0) {
                  translatedText = libTranslated.trim();
                  console.log('✅ LibreTranslate fallback succeeded');
                }
              }
            } catch (lfErr) {
              console.warn('LibreTranslate fallback failed:', lfErr);
            }
          }
        } catch (compErr) {
          console.warn('Translation compare check failed:', compErr);
        }
      } catch (translateError) {
        console.error(`❌ Translation failed for ${language}:`, translateError);
        // Fall back to original text if translation fails
        translatedText = originalText;
      }
    }

    return new Response(
      JSON.stringify({ 
        originalText, 
        translatedText, 
        language, 
        langCode: fullLangCode, 
        success: true 
      }), 
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in vision-speak function:", errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        success: false 
      }), 
      {
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
