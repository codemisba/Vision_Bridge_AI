"""
Website Analyzer Backend - Flask Server

Install: pip install flask flask-cors requests beautifulsoup4 python-dotenv
Run: python website_analyzer_backend.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Get Lovable API Key from environment
LOVABLE_API_KEY = os.getenv('LOVABLE_API_KEY')

LANGUAGE_NAMES = {
    'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French',
    'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
    'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic',
    'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu', 'mr': 'Marathi',
    'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'ur': 'Urdu'
}


# Map common language names and short codes to standardized short codes
LANGUAGE_CODE_MAP = {
    'english': 'en', 'en': 'en',
    'hindi': 'hi', 'hi': 'hi',
    'spanish': 'es', 'es': 'es',
    'french': 'fr', 'fr': 'fr',
    'german': 'de', 'de': 'de',
    'italian': 'it', 'it': 'it',
    'portuguese': 'pt', 'pt': 'pt',
    'russian': 'ru', 'ru': 'ru',
    'japanese': 'ja', 'ja': 'ja',
    'korean': 'ko', 'ko': 'ko',
    'chinese': 'zh', 'zh': 'zh', 'zh-cn': 'zh',
    'arabic': 'ar', 'ar': 'ar',
    'bengali': 'bn', 'bn': 'bn',
    'tamil': 'ta', 'ta': 'ta',
    'telugu': 'te', 'te': 'te',
    'marathi': 'mr', 'mr': 'mr',
    'gujarati': 'gu', 'gu': 'gu',
    'kannada': 'kn', 'kn': 'kn',
    'malayalam': 'ml', 'ml': 'ml',
    'punjabi': 'pa', 'pa': 'pa',
    'urdu': 'ur', 'ur': 'ur'
}


def normalize_language_code(value: str) -> str:
    """Return a standardized short language code for a given input (code or name)."""
    if not value:
        return 'en'
    v = str(value).strip().lower()
    return LANGUAGE_CODE_MAP.get(v, 'en')

def extract_text_from_html(html_content):
    """Extract clean text from HTML"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        text = soup.get_text(separator=' ', strip=True)
        import re
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove common boilerplate phrases
        text = re.sub(r'(?i)please ensure javascript is enabled', ' ', text)
        text = re.sub(r'(?i)please enable javascript', ' ', text)
        text = re.sub(r'(?i)\bloading(?:\.{1,3})?\b', ' ', text)
        text = re.sub(r'\s{2,}', ' ', text).strip()
        return text[:8000]
    except Exception as e:
        logger.error(f"HTML extraction error: {e}")
        return html_content[:5000]

def translate_with_api(text, target_lang):
    """Translate using public LibreTranslate API"""
    try:
        response = requests.post(
            'https://libretranslate.de/translate',
            json={
                'q': text,
                'source': 'en',
                'target': target_lang,
                'format': 'text'
            },
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get('translatedText', text)
    except Exception as e:
        logger.warning(f"Translation API error: {e}")
    return text


def analyze_with_ai(content, target_language='en'):
    """Analyze content using Lovable AI (Gemini) or fallback to basic analysis"""
    # Normalize incoming language (accept names or codes)
    lang_code = normalize_language_code(target_language)
    lang_name = LANGUAGE_NAMES.get(lang_code, lang_code)

    # If no LOVABLE_API_KEY, use basic analysis with LibreTranslate fallback
    if not LOVABLE_API_KEY:
        logger.warning("LOVABLE_API_KEY not set - using basic analysis with translation fallback")
        english_analysis = f"Website Content Summary:\n\n{content[:1000]}"
        
        if lang_code == 'en':
            return english_analysis, english_analysis
        logger.info(f"🌐 Translating to {lang_name} ({lang_code})...")
        translated = translate_with_api(english_analysis, lang_code)
        return english_analysis, translated

    try:
        # Step 1: Analyze in English
        logger.info("🤖 Analyzing with AI...")
        response = requests.post(
            'https://ai.gateway.lovable.dev/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {LOVABLE_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'google/gemini-2.5-flash',
                'messages': [
                    {'role': 'system', 'content': 'You are a website analyzer. Provide a clear, concise summary including: main purpose, key features, target audience, and important info. Keep under 300 words.'},
                    {'role': 'user', 'content': f'Analyze this website content:\n\n{content}'}
                ]
            },
            timeout=30
        )

        if response.status_code != 200:
            logger.error(f"AI analysis failed: {response.status_code}")
            english_analysis = f"Website Content Summary:\n\n{content[:1000]}"
        else:
            english_analysis = response.json().get('choices', [{}])[0].get('message', {}).get('content', content[:1500])
        
        # Step 2: Translate if needed
        if lang_code == 'en':
            return english_analysis, english_analysis

        logger.info(f"🌐 Translating to {lang_name} ({lang_code})...")
        translate_response = requests.post(
            'https://ai.gateway.lovable.dev/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {LOVABLE_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'google/gemini-2.5-flash',
                'messages': [
                    {'role': 'system', 'content': f'Translate the following text to {lang_name}. Provide only the translation.'},
                    {'role': 'user', 'content': english_analysis}
                ]
            },
            timeout=30
        )

        if translate_response.status_code == 200:
            translated = translate_response.json().get('choices', [{}])[0].get('message', {}).get('content', '') or ''
            
            # Check if translation is valid (not identical to English and not empty)
            try:
                if translated.strip() and translated.strip().lower() != english_analysis.strip().lower():
                    logger.info(f"✅ AI translation successful")
                    return english_analysis, translated
                else:
                    logger.warning('AI translation equals English or is empty; using LibreTranslate fallback')
                    translated = ''  # Mark for fallback
            except Exception:
                translated = ''

        # If AI translation didn't work, use LibreTranslate as guaranteed fallback
        if not translated:
            logger.info(f"📡 Using LibreTranslate for {lang_name}...")
            try:
                translated = translate_with_api(english_analysis, lang_code)
                if translated and translated.strip():
                    logger.info(f"✅ LibreTranslate translation successful")
                    return english_analysis, translated
            except Exception as le:
                logger.warning(f'LibreTranslate fallback failed: {le}')
        
        # Last resort: return English
        logger.warning(f"⚠️ All translations failed, returning English")
        return english_analysis, english_analysis

    except Exception as e:
        logger.error(f"AI error: {e}")
        english_analysis = f"Website Content Summary:\n\n{content[:1000]}"
        if target_language == 'en':
            return english_analysis, english_analysis
        translated = translate_with_api(english_analysis, target_language)
        return english_analysis, translated

@app.route('/api/analyze-website', methods=['POST', 'OPTIONS'])
def analyze_website():
    """Analyze website and translate"""
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.json or {}
        website_url = data.get('websiteUrl', '').strip()
        target_language = data.get('targetLanguage', 'en')

        if not website_url:
            return jsonify({'error': 'Website URL is required'}), 400

        if not website_url.startswith(('http://', 'https://')):
            website_url = 'https://' + website_url

        logger.info(f"🌐 Fetching: {website_url}")

        # Fetch website
        try:
            response = requests.get(
                website_url,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; VisionSpeak/1.0)'},
                timeout=15
            )
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"Fetch error: {e}")
            return jsonify({'error': 'Could not fetch website. Check the URL.'}), 400

        # Extract and analyze
        clean_text = extract_text_from_html(response.text)
        english_analysis, translated_analysis = analyze_with_ai(clean_text, target_language)

        return jsonify({
            'success': True,
            'websiteUrl': website_url,
            'englishAnalysis': english_analysis,
            'translatedAnalysis': translated_analysis
        }), 200

    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'api_configured': bool(LOVABLE_API_KEY)}), 200


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'name': 'VisionSpeak Website Analyzer',
        'status': 'running',
        'api_configured': bool(LOVABLE_API_KEY),
        'languages': list(LANGUAGE_NAMES.keys())
    }), 200

@app.route('/api/translate', methods=['POST', 'OPTIONS'])
def api_translate():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.json or {}
    text = data.get('text', '')
    target = data.get('target', 'en')
    if not text:
        return jsonify({'error': 'text is required'}), 400

    # Normalize target
    target_code = normalize_language_code(target)

    # Prefer Lovable translation if API key available
    if LOVABLE_API_KEY:
        try:
            target_name = LANGUAGE_NAMES.get(target_code, target_code)
            resp = requests.post(
                'https://ai.gateway.lovable.dev/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {LOVABLE_API_KEY}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'google/gemini-2.5-flash',
                    'messages': [
                        {'role': 'system', 'content': f'Translate the following text to {target_name}. Provide only the translation.'},
                        {'role': 'user', 'content': text}
                    ]
                },
                timeout=20
            )
            if resp.status_code == 200:
                translated = resp.json().get('choices', [{}])[0].get('message', {}).get('content', '')
                # If Lovable returned the same text as input (or empty), fall back to LibreTranslate
                try:
                    if translated and translated.strip().lower() == text.strip().lower():
                        logger.warning('Lovable translation equals input; using LibreTranslate fallback')
                        lib = translate_with_api(text, target_code)
                        if lib and lib.strip():
                            translated = lib
                except Exception:
                    pass
                return jsonify({'translatedText': translated}), 200
        except Exception as e:
            logger.warning(f'Lovable translate failed: {e}')

    # Fallback to LibreTranslate
    translated = translate_with_api(text, target_code)
    return jsonify({'translatedText': translated}), 200


if __name__ == '__main__':
    print("\n🚀 VisionSpeak Backend Starting...")
    print(f"📍 http://localhost:5000")
    print(f"🔑 API Key: {'✅ Configured' if LOVABLE_API_KEY else '❌ Not set'}")
    print("\nSet LOVABLE_API_KEY in .env file for AI features\n")
    app.run(debug=True, port=5000)

