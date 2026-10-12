import React, { useState } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' }
];

export default function WebsiteAnalyzer() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null as { englishAnalysis: string; translatedAnalysis: string; websiteUrl: string; } | null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAnalyze = async () => {
    if (!websiteUrl.trim()) { window.alert('Please enter a website URL'); return; }
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    try { new URL(formattedUrl); } catch { window.alert('Please enter a valid URL'); return; }
    setIsLoading(true); setResult(null);
    try {
      // POST to local backend endpoint
      const res = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: formattedUrl, targetLanguage }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Analyze endpoint error:', errText);
        window.alert('Failed to analyze website');
        return;
      }
      const payload = await res.json();
      if (!payload) { window.alert('No response from analyze function'); return; }
      if (payload.error) { window.alert(payload.error); return; }
      setResult({ englishAnalysis: payload.englishAnalysis, translatedAnalysis: payload.translatedAnalysis, websiteUrl: payload.websiteUrl });
      if (payload.translatedAnalysis === payload.englishAnalysis && targetLanguage !== 'en') {
        console.info('Translation may be unavailable or identical to English');
      } else {
        // small success indicator (no external toast lib)
        console.info('Website analyzed successfully!');
      }
    } catch (err) {
      console.error('Error analyzing website:', err);
      window.alert('Failed to analyze website. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleSpeak = () => {
    if (!result) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const textToSpeak = targetLanguage === 'en' ? result.englishAnalysis : result.translatedAnalysis;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap: Record<string, string> = {
      'en': 'en-US', 'hi': 'hi-IN', 'es': 'es-ES', 'fr': 'fr-FR',
      'de': 'de-DE', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU',
      'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN', 'ar': 'ar-SA',
    };
    utterance.lang = langMap[targetLanguage] || 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); window.alert('Text-to-speech failed'); };
    window.speechSynthesis.speak(utterance); setIsSpeaking(true);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto shadow-xl border-0 bg-card/80 backdrop-blur p-6 rounded-lg">
          <div className="text-center pb-2">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">Website Analyzer</h2>
            <p className="text-muted-foreground mt-2">Enter a website URL to analyze its content and translate to your preferred language</p>
          </div>
          <div className="space-y-6 p-6 md:p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Website URL</label>
              <div className="relative">
                <input className="pl-10 h-12 text-base w-full border rounded" type="url" placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl((e.target as HTMLInputElement).value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Translate To</label>
              <select value={targetLanguage} onChange={(e) => setTargetLanguage((e.target as HTMLSelectElement).value)} className="h-12 w-full border rounded px-3">
                {languages.map((lang) => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
              </select>
            </div>
            <button onClick={handleAnalyze} disabled={isLoading || !websiteUrl.trim()} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white rounded">
              {isLoading ? 'Analyzing...' : 'Analyze & Translate'}
            </button>
            {result && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Analysis Results</h3>
                  <button onClick={handleSpeak} className="px-3 py-1 border rounded">{isSpeaking ? 'Stop' : 'Listen'}</button>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Analyzed: <span className="text-primary font-medium">{result.websiteUrl}</span></p>
                </div>
                {targetLanguage !== 'en' && (
                  <div className="bg-background/50 p-4 rounded border">
                    <h4 className="text-lg text-primary">English Analysis</h4>
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{result.englishAnalysis}</div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20 p-4 rounded">
                  <h4 className="text-lg text-primary">{targetLanguage === 'en' ? 'Analysis' : `Translated (${languages.find(l => l.code === targetLanguage)?.name})`}</h4>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{result.translatedAnalysis}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
