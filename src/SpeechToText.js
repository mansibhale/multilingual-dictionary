// SpeechToText.js
import React from 'react';

export default function SpeechToText({ setInputWord, handleSearch, lang }) {
  const handleSpeechInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();

    // Set language dynamically
    switch (lang) {
      case 'Marathi':
        recognition.lang = 'mr-IN';
        break;
      case 'Hindi':
        recognition.lang = 'hi-IN';
        break;
      case 'Sanskrit':
        recognition.lang = 'mr-IN';
        break;
      default:
        recognition.lang = 'en-US';
    }

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    console.log(`🎙️ Listening for ${lang} word...`);

    recognition.onresult = (event) => {
      const spokenWord = event.results[0][0].transcript.trim();
      console.log("✅ Recognized:", spokenWord);
      setInputWord(spokenWord);
      handleSearch(); // auto-translate
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("🛑 Recognition ended");
    };
  };

  return (
    <div
  onClick={handleSpeechInput}
  className="absolute right-3 top-1/2 transform -translate-y-1/2 
             bg-purple-200 hover:bg-purple-300 
             text-purple-700 p-2 rounded-full shadow-md transition 
             cursor-pointer flex items-center justify-center"
  title={`Click to speak ${lang}`}
>
  {/* Proper microphone SVG */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
    <path fillRule="evenodd" d="M5 10a5 5 0 0010 0h-1a4 4 0 11-8 0H5z" clipRule="evenodd" />
    <path d="M10 15v3m-3 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>

  );
}
