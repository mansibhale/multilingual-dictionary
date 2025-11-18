// SpeechToText.js
import React from 'react';

export default function SpeechToText({ setInputWord, handleSearch, lang }) {
  const handleSpeechInput = async () => {
    // Use browser SpeechRecognition if lang is Marathi/Hindi/English
    if (lang === 'Sanskrit') {
      // For Sanskrit, we use OpenAI Whisper API via Electron main process
      try {
        // Record audio from mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });

          // Save audio to temp file in Electron
          const arrayBuffer = await blob.arrayBuffer();
          const transcription = await window.electronAPI.transcribeAudio(arrayBuffer);
          setInputWord(transcription);
          handleSearch();
        };

        mediaRecorder.start();
        console.log('🎙️ Recording Sanskrit...');
        setTimeout(() => mediaRecorder.stop(), 5000); // record 5 sec
      } catch (err) {
        console.error('❌ Sanskrit speech recognition error:', err);
        alert('Error recording Sanskrit speech. Check microphone permissions.');
      }
    } else {
      // Fallback to browser SpeechRecognition for other languages
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser. Use Chrome/Edge.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'Marathi' ? 'mr-IN' : lang === 'Hindi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();
      console.log(`🎙️ Listening for ${lang} word...`);

      recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim();
        console.log("✅ Recognized:", spokenWord);
        setInputWord(spokenWord);
        handleSearch();
      };

      recognition.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
      };
    }
  };

  return (
    <div
      onClick={handleSpeechInput}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-200 hover:bg-purple-300 text-purple-700 p-2 rounded-full shadow-md transition cursor-pointer flex items-center justify-center"
      title={`Click to speak ${lang}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
        <path fillRule="evenodd" d="M5 10a5 5 0 0010 0h-1a4 4 0 11-8 0H5z" clipRule="evenodd" />
        <path d="M10 15v3m-3 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
