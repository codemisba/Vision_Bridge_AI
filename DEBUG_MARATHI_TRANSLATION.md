# Debug: Marathi Translation Not Working

## Problem
Marathi translations are showing the same as English text instead of being translated to Marathi script.

## Root Causes Identified

### 1. **LOVABLE_API_KEY Not Configured** (PRIMARY ISSUE)
The edge function requires `LOVABLE_API_KEY` to be configured in Supabase Edge Function secrets.

**What this means:**
- Without the API key, the translation API call fails silently
- The code falls back to returning the original English text
- Users see English text in both "Original Text" and "Translated/Processed Text"

**Fix:**
1. Go to Supabase Dashboard
2. Navigate to: Edge Functions → vision-speak
3. Click on "Secrets" or "Environment Variables"
4. Add: `LOVABLE_API_KEY` = Your Lovable API key
5. Redeploy the function

### 2. **Edge Function Needs Redeployment**
The edge function code has been updated with:
- Better error logging to diagnose translation failures
- Improved translation prompts for Gemini API
- Language name mapping for proper translation instructions
- Enhanced error handling

**To redeploy manually:**

```bash
# Method 1: Using Supabase CLI
cd c:\Users\User\Desktop\seehear
supabase functions deploy vision-speak

# Method 2: Using NPX (if npm is installed)
npx supabase functions deploy vision-speak

# Method 3: Using Deno (if installed)
deno task deploy
```

## Testing Marathi Translation

### Step 1: Configure API Key
1. Log in to Supabase Dashboard
2. Select project: `tezndjclbdbrlxbjwlkz`
3. Go to Edge Functions
4. Find `vision-speak` function
5. Look for "Secrets" or "Environment Variables" section
6. Add: `LOVABLE_API_KEY` with your Lovable.dev API key value

### Step 2: Redeploy Function
Click "Redeploy" button in the function details page OR use CLI

### Step 3: Test in Browser
1. Refresh page (Ctrl+F5 for hard refresh)
2. Upload an image
3. Select "मराठी (Marathi)" from dropdown
4. Click "Generate Result"
5. Check the results:
   - **Original Text** = English caption from image
   - **Translated/Processed Text** = Should now be in Marathi

### Step 4: Verify in Browser Console
Open Developer Tools (F12) → Console tab

Look for logs like:
```
Language: Marathi, Lang Code: mr
Starting translation to Marathi (mr)...
✅ Successfully translated to Marathi: मराठी मजकूर येथे दिसेल...
```

## What Changed in Edge Function

### Before:
```typescript
// Simple translation prompt without language name mapping
messages: [
  { role: "system", content: `You are a professional translator. Translate the following text to ${language}.` },
  { role: "user", content: originalText }
]
```

### After:
```typescript
// Map language code to language name for proper translation
const languageNameMap: Record<string, string> = {
  "hi": "Hindi",
  "mr": "Marathi",
  "ur": "Urdu",
  // ... etc
};

const targetLang = languageNameMap[langCode] || language;

messages: [
  { role: "system", content: `You are a professional translator. Your task is to translate text to ${targetLang}. Respond ONLY with the translated text in ${targetLang} script.` },
  { role: "user", content: `Translate this to ${targetLang}: ${originalText}` }
]
```

This ensures:
✅ Gemini knows exactly which language to translate to
✅ Explicit instruction to return ONLY translated text
✅ Better logging for debugging
✅ Proper error handling with fallbacks

## Troubleshooting

### Still seeing English after API key configuration?

1. **Check Edge Function Logs:**
   - Supabase Dashboard → Edge Functions → vision-speak → Logs
   - Look for error messages or status codes
   - Check if the function is actually being called

2. **Test API Key:**
   ```bash
   # Test if API key works with curl (from terminal/PowerShell)
   $headers = @{
     "Authorization" = "Bearer YOUR_LOVABLE_API_KEY"
     "Content-Type" = "application/json"
   }
   
   $body = @{
     model = "google/gemini-2.5-flash"
     messages = @(
       @{ role = "system"; content = "You are a translator" },
       @{ role = "user"; content = "Translate to Marathi: Hello world" }
     )
   } | ConvertTo-Json
   
   Invoke-WebRequest -Uri "https://ai.gateway.lovable.dev/v1/chat/completions" `
     -Headers $headers `
     -Body $body `
     -Method POST
   ```

3. **Verify Language Code Mapping:**
   The edge function now maps:
   - `mr` → `Marathi`
   - `mr-IN` → used for TTS (text-to-speech)
   
   This should be correct and match the frontend.

## Next Steps

1. **Action Required:** Configure `LOVABLE_API_KEY` in Supabase
2. **Then:** Redeploy the edge function
3. **Finally:** Test Marathi translation
4. **If still not working:** Check edge function logs for specific error messages

## Quick Reference: Language Codes

| Language | Short Code | Full Code | Expected Output |
|----------|-----------|-----------|-----------------|
| English | en | en-US | English text |
| Hindi | hi | hi-IN | हिंदी पाठ |
| Marathi | mr | mr-IN | मराठी मजकूर |
| Urdu | ur | ur-IN | اردو ٹیکسٹ |
| Telugu | te | te-IN | తెలుగు టెక్‌స్‌ట్‌ |
| Tamil | ta | ta-IN | தமிழ் உரை |
| Kannada | kn | kn-IN | ಕನ್ನಡ ಪಠ್ಯ |
| Malayalam | ml | ml-IN | മലയാളം ടെക്സ്റ്റ് |

---

**File modified:** `supabase/functions/vision-speak/index.ts`
**Changes include:** Enhanced logging, language name mapping, improved error handling
**Needs:** LOVABLE_API_KEY configuration + function redeployment
