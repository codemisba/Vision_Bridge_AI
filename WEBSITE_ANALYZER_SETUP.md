# Website Analyzer Backend Setup Guide

## Quick Start

The Website Analyzer requires a backend server to function. Follow these steps:

### 1. Install Required Dependencies

```bash
pip install flask flask-cors requests beautifulsoup4 python-dotenv
```

### 2. Run the Backend Server

```bash
python website_analyzer_backend.py
```

The server will start on `http://localhost:5000`

### 3. Test the Backend

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Website Analyzer Backend is running"
}
```

### 4. Use the Website Analyzer

Now you can use the Website Analyzer in the main application:
1. Open `index.html` in your browser
2. Enter a website URL in the "Website Analyzer" section
3. Select a language
4. Click "Analyze & Translate"

## API Endpoints

### POST `/api/analyze-website`
Analyzes a website and returns the content summary.

**Request:**
```json
{
  "websiteUrl": "https://example.com",
  "targetLanguage": "en"
}
```

**Response:**
```json
{
  "englishAnalysis": "Website analysis content...",
  "translatedAnalysis": "Translated content...",
  "targetLanguage": "en",
  "websiteUrl": "https://example.com"
}
```

### GET `/api/health`
Health check endpoint to verify the server is running.

## Troubleshooting

### "Failed to fetch" Error
- Make sure the backend server is running (`python website_analyzer_backend.py`)
- Check that the server is accessible at `http://localhost:5000`
- Verify that Flask-CORS is installed for cross-origin requests

### Website Content Issues
- Some websites may block web scraping. The backend includes appropriate headers to minimize this.
- Very large websites are automatically trimmed to 15,000 characters for processing

### Missing Dependencies
If you get import errors, install missing packages:
```bash
pip install flask flask-cors requests beautifulsoup4 python-dotenv
```

## Advanced: Using AI API for Better Analysis

To get AI-powered analysis and translation:

1. Get an API key from a service like:
   - Lovable AI
   - OpenAI
   - Anthropic Claude
   - Google Gemini

2. Set the API key as an environment variable:
   ```bash
   # Windows
   set LOVABLE_API_KEY=your-api-key-here
   python website_analyzer_backend.py
   
   # Linux/Mac
   export LOVABLE_API_KEY=your-api-key-here
   python website_analyzer_backend.py
   ```

3. Update the `website_analyzer_backend.py` file to use the API for better analysis

## Notes

- The basic backend provides simple content extraction and preview
- For production, configure an AI API key for full analysis capabilities
- The backend respects robots.txt and includes user-agent headers
- Website content is limited to 15,000 characters for performance
