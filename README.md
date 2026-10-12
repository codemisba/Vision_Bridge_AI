# Vision Bridge AI

**Vision Bridge AI** is an AI-powered web application designed to make visual and web content easier to understand and access. It seamlessly combines AI image captioning, multilingual translation, website content analysis, and text-to-speech technologies to help users consume digital information in multiple formats and languages.

---

## ✨ Features

* **AI Image Captioning**: Generate detailed, descriptive captions from uploaded images.
* **Multilingual Translation**: Translate captions and website analysis instantly into supported languages.
* **Text-to-Speech**: Listen to generated or translated text using browser-based speech synthesis.
* **Website Content Analysis**: Extract and analyze website content using a target URL.
* **Text & Document Processing**: Process supported text files and documents.
* **Download Results**: Save your generated text and insights for future reference.

---

## 🛠️ Tech Stack

* **Frontend**: HTML, CSS, JavaScript, React, TypeScript
* **Build Tool**: Vite
* **Backend**: Python, Flask, Flask-CORS
* **AI Processing**: Gemini (via the Lovable AI Gateway)
* **Cloud Functions**: Supabase Edge Functions
* **Text-to-Speech**: Web Speech API
* **Web Scraping**: Requests, BeautifulSoup

---

## 🌍 Supported Languages

The application is configured to support the following languages:
* English
* Hindi
* Marathi
* Urdu
* Kannada
* Telugu
* Tamil
* Malayalam

> **Note:** Translation and speech availability may vary depending on active API configurations, browser support, and installed system voices.

---

## ⚙️ Installation and Setup

### Prerequisites
* Node.js and npm
* Python 3
* A configured Supabase project
* Required AI API credentials

### 1. Clone the Repository
```bash
git clone https://github.com/codemisba
cd vision-bridge-ai
```


### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root and add your Supabase configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Start the Frontend
```bash
npm run dev
```
Open the local URL provided by Vite in your terminal (usually `http://localhost:5173`).

### 5. Set Up the Backend
Install the Python dependencies:
```bash
pip install -r requirements.txt
```
Run the website analyzer backend from the directory containing `website_analyzer_backend.py`:
```bash
python website_analyzer_backend.py
```
The backend runs on `http://localhost:5000` by default.

### 6. Deploy the Supabase Function
After installing and configuring the Supabase CLI, link your project and deploy the Edge Function:
```bash
supabase functions deploy vision-speak
```

---

## 🚀 How It Works

1. **Input**: Upload an image or enter a website URL.
2. **Select Language**: Pick a supported target language.
3. **Analyze**: Generate the image caption or website content analysis.
4. **Translate**: Convert the resulting text into the selected language.
5. **Consume**: Listen to the speech output or download the final text.

---

## 🎯 Project Objective

The objective of **Vision Bridge AI** is to bridge the gap between visual information and accessible communication. By combining artificial intelligence, language translation, website analysis, and speech technologies, the application aims to make digital information universally easier to understand across different languages and formats.

---

## 🔮 Future Enhancements

* Improve translation accuracy and context reliability.
* Expand multilingual speech support with high-quality natural voices.
* Enhance accessibility and mobile-first responsive design.
* Improve deep-scraping website and document content analysis.
* Add more accessibility-focused AI capabilities.
