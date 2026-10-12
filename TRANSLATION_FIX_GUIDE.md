# Translation Not Working - Fix Guide

## Problem
Hindi, Marathi, and Urdu translations are not being generated. The translated text shows the same as the original English text.

## Root Cause
The `LOVABLE_API_KEY` environment variable is NOT configured in your Supabase Edge Function secrets. Without this key, the translation API cannot call the Gemini 2.5 Flash model for translation.

## Solution Steps

### Step 1: Get Your Lovable API Key
1. Go to your Lovable.dev account (or create one at lovable.dev)
2. Generate or copy your API key from the settings/API section
3. Keep this key safe and handy

### Step 2: Configure in Supabase Dashboard
1. Go to Supabase Dashboard → Your Project
2. Navigate to: **Edge Functions** → **vision-speak**
3. Click on the **vision-speak** function
4. Look for **Secrets** section (or Environment Variables)
5. Click **Add Secret** or **Add Environment Variable**
6. Enter:
   - **Name:** `LOVABLE_API_KEY`
   - **Value:** (paste your actual Lovable API key)
7. Click **Save** or **Add**

### Step 3: Redeploy Edge Function
Run in terminal:
```bash
supabase functions deploy vision-speak
```

Or deploy through Supabase Dashboard:
- Go to Edge Functions → vision-speak
- Click the three dots menu
- Select "Redeploy"

### Step 4: Test
1. Refresh your browser (F5)
2. Upload an image
3. Select "मराठी (Marathi)" or "हिन्दी (Hindi)" or "اردو (Urdu)"
4. Click "Generate Result"
5. The translation should now appear in the selected language!

## Verification

After configuration, you should see:
- **Original Text:** English caption of the image
- **Translated/Processed Text (Marathi/Hindi/Urdu):** Caption in that language

## Alternative: Manual Gemini API

If you don't have Lovable API access, you can use Google's Gemini API directly:

1. Go to https://aistudio.google.com
2. Create API key
3. Update the edge function to use Google's API endpoint instead
4. Test and verify

## What Each Language Code Does

| Language | Code | TTS Code | Status |
|----------|------|----------|--------|
| English | en | en-US | ✅ Working |
| Hindi | hi | hi-IN | ⏳ Needs API Key |
| Marathi | mr | mr-IN | ⏳ Needs API Key |
| Urdu | ur | ur-IN | ⏳ Needs API Key |
| Telugu | te | te-IN | ✅ Working |
| Tamil | ta | ta-IN | ✅ Working |
| Kannada | kn | kn-IN | ✅ Working |
| Malayalam | ml | ml-IN | ✅ Working |

## Troubleshooting

### Still Not Working?
1. Check Supabase Function Logs:
   - Go to Edge Functions → vision-speak → Logs
   - Look for error messages
   - Check if LOVABLE_API_KEY is showing as configured

2. Common Error Messages:
   - "LOVABLE_API_KEY environment variable is not set" → Configure the secret
   - "Translation API error: 401" → Check API key is correct
   - "Translation API error: 429" → Rate limit reached, wait and retry

3. Test the API Key:
   - Use curl or Postman to test the Lovable API directly
   - Verify the key has permission to access translation models

## After Configuration

Once LOVABLE_API_KEY is configured:
✅ Hindi, Marathi, Urdu translations will work
✅ SPEAK button will play audio in correct language
✅ Download will contain translated text
✅ Process Another File will work seamlessly

---

**Need Help?**
- Check Supabase documentation: https://supabase.com/docs/guides/functions
- Check Lovable.dev documentation for API usage
- Review edge function logs in Supabase dashboard
