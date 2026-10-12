# VisionSpeak Integration Setup Guide

## Overview
This document explains how the VisionSpeak AI system has been integrated into your project, which processes images and text files, generates captions using AI, translates them to multiple languages, and provides text-to-speech functionality.

## File Structure

### 1. **Configuration Files**

#### `.env` (Root Directory)
Contains Supabase project credentials needed for API calls:
```
VITE_SUPABASE_PROJECT_ID="tezndjclbdbrlxbjwlkz"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://tezndjclbdbrlxbjwlkz.supabase.co"
```

#### `supabase/config.toml`
Supabase project configuration:
```toml
project_id = "tezndjclbdbrlxbjwlkz"

[functions.vision-speak]
verify_jwt = false
```

### 2. **JavaScript Implementation**

#### `assets/js/visionspeak.js`
Main application logic for the VisionSpeak UI. Key features:

**Class Structure: `VisionSpeakApp`**
- **`init()`**: Initializes the app and sets up event listeners
- **`cacheDOM()`**: Caches all DOM elements for performance
- **`setupEventListeners()`**: Attaches event handlers to file input, language selector, and generate button
- **`handleFileSelect(event)`**: Processes file selection
- **`showFilePreview(file)`**: Displays preview of uploaded image or file info
- **`handleGenerate()`**: Orchestrates the file processing workflow
- **`processFile(file, language)`**: Makes API call to Supabase Edge Function
- **`speakText(text, langCode)`**: Uses Web Speech API for text-to-speech
- **`stopSpeaking()`**: Cancels ongoing speech synthesis
- **`displayResult(result)`**: Renders results with proper styling
- **`downloadResult()`**: Allows users to download results as text file
- **`showToast(message, type)`**: Displays notification messages
- **`escapeHtml(text)`**: Sanitizes HTML to prevent XSS attacks

**Supabase Credentials** (Updated):
```javascript
const SUPABASE_URL = 'https://tezndjclbdbrlxbjwlkz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3. **Supabase Edge Function**

#### `supabase/functions/vision-speak/index.ts`
Handles server-side processing:

**Step 1: Image Captioning**
- Receives base64-encoded image from client
- Sends to Gemini 2.5 Flash via Lovable AI Gateway
- Generates detailed caption for accessibility

**Step 2: Translation**
- Translates caption to selected language (Hindi, Telugu, Tamil, Kannada, Malayalam)
- Uses same Gemini 2.5 Flash model for translation
- Language codes: English (en), Hindi (hi), Telugu (te), Tamil (ta), Kannada (kn), Malayalam (ml)

**Step 3: Response**
- Returns original text, translated text, language, and language code
- All operations handled server-side for security

### 4. **HTML Integration**

#### `index.html`
The VisionSpeak UI section (lines 1320-1345):
```html
<section id="visionspeak-ui">
  <h2>VisionSpeak — Image / Text Processor</h2>
  <p>Upload an image or text file, choose language and click Generate — results appear below.</p>
  
  <input data-role="file-input" type="file" accept="image/*,.txt,.pdf" />
  <select data-role="language-select">
    <option>English</option>
    <option>Hindi</option>
    <option>Telugu</option>
    <option>Tamil</option>
    <option>Kannada</option>
    <option>Malayalam</option>
  </select>
  <button data-role="generate-btn">✨ Generate Result</button>
  
  <div data-role="file-preview"></div>
  <div data-role="loading-spinner">Processing...</div>
  <div data-role="result-display"></div>
</section>
```

## How It Works

### User Flow:
1. User uploads an image or text file
2. User selects a language for translation
3. User clicks "Generate Result"
4. Frontend sends file to Supabase Edge Function
5. Backend processes the file:
   - If image: generates AI caption using Gemini
   - If text: uses provided text
   - Translates to selected language
6. Results displayed with:
   - Original text/caption
   - Translated text
   - Language indicator
   - Speak, Stop, and Download buttons
7. User can listen to translated text using browser TTS

### API Call Flow:
```
Client (visionspeak.js)
    ↓
POST /functions/v1/vision-speak
    ↓
Supabase Edge Function (index.ts)
    ↓
Lovable AI Gateway (Gemini 2.5 Flash)
    ↓
Response with captions and translations
```

## Required Environment Variables

**For Lovable AI Gateway:**
- `LOVABLE_API_KEY`: Your Lovable API key (set in Supabase Edge Function secrets)

**For Supabase Client:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anonymous key

## Supported File Types
- **Images**: PNG, JPG, JPEG, WEBP, GIF
- **Text**: .txt, .pdf (text content)
- **Size Limit**: Up to 10MB

## Supported Languages
- English
- Hindi (hi-IN)
- Telugu (te-IN)
- Tamil (ta-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)

## Text-to-Speech
Uses Web Speech API (browser-native):
- No additional dependencies required
- Works on modern browsers (Chrome, Firefox, Safari, Edge)
- Supports all configured languages

## Error Handling
- Credentials validation on load
- Demo mode fallback if credentials not configured
- Network error handling
- User-friendly toast notifications
- Console logging for debugging

## Browser Compatibility
- Chrome 25+
- Firefox 25+
- Safari 14.1+
- Edge 79+
- Requires JavaScript enabled
- Supports CORS for API calls

## Security Features
- HTML sanitization to prevent XSS
- JWT-based API authentication
- CORS headers configured
- Edge Function verification disabled (adjust as needed)
- Environment variables for sensitive credentials

## Troubleshooting

### Issue: "Supabase credentials not configured"
**Solution**: Ensure `.env` file exists with proper credentials

### Issue: "API error: 401"
**Solution**: Check that SUPABASE_ANON_KEY is correct

### Issue: Image processing fails
**Solution**: Verify image is base64-encoded correctly, check file size

### Issue: Text-to-speech not working
**Solution**: Ensure browser supports Web Speech API, check language code

## Testing
1. Open `index.html` in a browser
2. Upload a test image or text file
3. Select a language
4. Click "Generate Result"
5. Wait for processing (may take 5-10 seconds)
6. Results will display with original and translated text
7. Click "Speak" to hear the translation

## Next Steps
1. Deploy Supabase Edge Function to your project
2. Configure LOVABLE_API_KEY in Supabase secrets
3. Test with sample images and text files
4. Customize styling as needed in visionspeak.js displayResult() method
5. Monitor Edge Function logs for debugging

---
**Last Updated**: January 2, 2026
