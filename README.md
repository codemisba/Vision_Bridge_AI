Vision Bridge AI
Connecting Visuals, Language, and Sound.
Vision Bridge AI is an AI-powered web application designed to make visual and web content easier to understand and access. It combines AI image captioning, multilingual translation, website content analysis, and text-to-speech to help users access information in different languages and formats.
✨ Features
- AI Image Captioning: Generate descriptive captions from uploaded images.
- Multilingual Translation: Translate captions and website analysis into supported languages.
- Text-to-Speech: Listen to generated or translated text using browser-based speech synthesis.
- Website Content Analysis: Extract and analyze website content using a URL.
- Text and Document Processing: Process supported text files and documents.
- Download Results: Save generated text for future reference.
🛠️ Tech Stack
- Frontend: HTML, CSS, JavaScript, React, TypeScript
- Build Tool: Vite
- Backend: Python, Flask, Flask-CORS
- AI Processing: Gemini through the Lovable AI Gateway
- Cloud Functions: Supabase Edge Functions
- Text-to-Speech: Web Speech API
- Web Scraping: Requests and BeautifulSoup
🌍 Supported Languages
The application is configured to support:
- English
- Hindi
- Marathi
- Urdu
- Kannada
- Telugu
- Tamil
- Malayalam
Translation and speech availability may vary depending on API configuration, browser support, and installed system voices.
⚙️ Installation and Setup
Prerequisites
- Node.js and npm
- Python 3
- A configured Supabase project
- Required AI API credentials
1. Clone the Repository
git clone https://github.com/YOUR-USERNAME/vision-bridge-ai.git
cd vision-bridge-ai
Replace YOUR-USERNAME with your GitHub username.
2. Install Frontend Dependencies
npm install
3. Configure Environment Variables
Create a .env file in the project root and add the required Supabase configuration:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
Configure LOVABLE_API_KEY as a secret in your Supabase Edge Function environment if required by your AI integration.
Important: Never upload private API keys, passwords, or other sensitive credentials to GitHub.
4. Start the Frontend
npm run dev
Open the local URL provided by Vite in your terminal.
5. Set Up the Backend
Install the Python dependencies:
pip install -r requirements.txt
Run the website analyzer backend from the directory containing website_analyzer_backend.py:
python website_analyzer_backend.py
The backend is expected to use http://localhost:5000 with the default configuration.
6. Deploy the Supabase Function
After installing and configuring the Supabase CLI, linking your project, and setting the required secrets, deploy the Edge Function:
supabase functions deploy vision-speak
🚀 How It Works
1. Upload an image or enter a website URL.
2. Select a supported language when needed.
3. Generate an image caption or website content analysis.
4. Translate the resulting text into the selected language.
5. Listen to the output or download the generated text.
🎯 Project Objective
The objective of Vision Bridge AI is to bridge the gap between visual information and accessible communication. By combining artificial intelligence, language translation, website analysis, and speech technologies, the application aims to make digital information easier to understand across languages and formats.
🔮 Future Enhancements
- Improve translation accuracy and reliability.
- Expand multilingual speech support.
- Enhance accessibility and responsive design.
- Improve website and document content analysis.
- Add more accessibility-focused AI features.
