import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import { Book, Star, Clock, Home, Sparkles, X, LogOut, Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, googleProvider } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { saveUserDataEncrypted, getUserDataDecrypted } from './services/firebaseService';
import { signInWithPopup, signOut } from 'firebase/auth';
import SpeechToText from './SpeechToText';
import Chatbot from "./Chatbot";

// Text-to-Speech Component
function TextToSpeech({ text, language, className = "" }) {
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (!window.speechSynthesis) {
        setIsAvailable(false);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getLanguageCode = (lang) => {
    const langMap = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Marathi': 'hi-IN',
      'Sanskrit': 'hi-IN'
    };
    return langMap[lang] || 'en-US';
  };

  const findVoiceForLanguage = (langCode, language) => {
    if (voices.length === 0) return null;

    let voice = voices.find(v => v.lang === langCode);
    
    if (!voice) {
      const langPrefix = langCode.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langPrefix));
    }
    
    if (!voice && (language === 'Marathi' || language === 'Sanskrit')) {
      voice = voices.find(v => v.lang.startsWith('hi'));
    }
    
    return voice || voices[0];
  };

  const speakWord = () => {
    if (!text || !isAvailable) return;

    window.speechSynthesis.cancel();
    
    setIsLoading(true);

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = getLanguageCode(language);
    utterance.lang = langCode;
    
    const voice = findVoiceForLanguage(langCode, language);
    if (voice) {
      utterance.voice = voice;
      console.log(`Using voice: ${voice.name} (${voice.lang}) for ${language}`);
    }

    utterance.rate = language === 'English' ? 0.9 : 0.75;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsLoading(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsLoading(false);
      
      if (event.error !== 'interrupted') {
        alert(`Error playing audio: ${event.error}. Your browser may not support ${language} voices.`);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech error:', error);
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <button
      onClick={speakWord}
      disabled={isLoading || !text}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
        isLoading || !text
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-purple-500 hover:bg-purple-600 text-white'
      } ${className}`}
      title={`Pronounce in ${language}`}
      aria-label={`Speak ${text} in ${language}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}

export default function MultilingualDictionaryApp() {
  const [user, setUser] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Hindi');
  const [inputWord, setInputWord] = useState('');
  const [outputWord, setOutputWord] = useState('');
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [wordOfDay, setWordOfDay] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  

  const devanagariKeys = [
    '\u0905', '\u0906', '\u0907', '\u0908', '\u0909', '\u090A', '\u090B', '\u0960', '\u090C', 
    '\u090F', '\u0910', '\u0913', '\u0914', '\u0902', '\u0903',
    '\u0915','\u0916','\u0917','\u0918','\u0919',
    '\u091A','\u091B','\u091C','\u091D','\u091E',
    '\u091F','\u0920','\u0921','\u0922','\u0923',
    '\u0924','\u0925','\u0926','\u0927','\u0928',
    '\u092A','\u092B','\u092C','\u092D','\u092E',
    '\u092F','\u0930','\u0932','\u0935','\u0936','\u0937','\u0938','\u0939',
    '\u0915\u094D\u0937', '\u091F\u094D\u0930', '\u091C\u094D\u091E',
    '\u093E', '\u093F', '\u0940', '\u0941', '\u0942', '\u0943', '\u0944', '\u0947', '\u0948', '\u094B', '\u094C'
  ];

  const languages = ['English', 'Hindi', 'Marathi', 'Sanskrit'];

  useEffect(() => {
    async function loadDictionary() {
      try {
        const data = await window.database.getWords();
        setDictionary(data);
        pickWordOfDay(data);
      } catch (err) {
        console.error("Error loading dictionary:", err);
      }
    }
    loadDictionary();
  }, []);

  const saveUserData = async (bookmarks, history) => {
    if (!user) return;
    try {
      await saveUserDataEncrypted(user.uid, { bookmarks, history });
    } catch (error) {
      console.error('Error saving encrypted data:', error);
    }
  };

  const loadUserData = async (user) => {
    try {
      const data = await getUserDataDecrypted(user.uid);
      if (data) {
        setBookmarks(data.bookmarks || []);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading encrypted data:', error);
      setBookmarks([]);
      setHistory([]);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserData(currentUser);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    saveUserData(bookmarks, history);
  }, [bookmarks, history]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleSearch = () => {
    if (inputWord.trim() === '') return;
    const row = dictionary.find(item => item[fromLang]?.toLowerCase() === inputWord.toLowerCase());
    if (row) {
      const translation = row[toLang] || 'Translation not available';
      const result = `${inputWord} → ${translation}`;
      setOutputWord(result);
      setHistory([result, ...history]);
    } else {
      setOutputWord('Word not found in dictionary');
    }
    setShowSuggestions(false);
  };

  const handleBookmark = (word) => {
    if (!bookmarks.includes(word)) setBookmarks([...bookmarks, word]);
  };

  const deleteBookmark = (word) => {
    setBookmarks(bookmarks.filter(w => w !== word));
  };

  const handleKeyboardInput = (char) => {
    setInputWord(prev => prev + char);
  };

  const pickWordOfDay = (dict) => {
    if (dict.length === 0) return;
    const randomIndex = Math.floor(Math.random() * dict.length);
    setWordOfDay(dict[randomIndex]);
  };

  const swapLanguages = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
  };

  const handleInputChange = (val) => {
    setInputWord(val);
    if (val.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = dictionary
      .filter(item => item[fromLang]?.toLowerCase().startsWith(val.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
        <h1 className="text-3xl text-purple-800 mb-6 font-bold">भाषा-Vault</h1>
        <button
          onClick={handleLogin}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition transform hover:-translate-y-1 hover:scale-105"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 font-sans p-4">

      <nav className="flex justify-around bg-purple-200 shadow-md py-4 rounded-xl sticky top-0 z-50 mb-6">
        {[{ id: 'home', icon: <Home />, label: 'Home' },
          { id: 'bookmarks', icon: <Star />, label: 'Bookmarks' },
          { id: 'history', icon: <Clock />, label: 'History' },
          { id: 'word', icon: <Sparkles />, label: 'Word of the Day' },
          { id: 'about', icon: <Book />, label: 'About' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === tab.id ? 'bg-purple-300 text-purple-800' : 'text-purple-700 hover:text-purple-900'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-1 px-4 py-2 rounded-full text-red-600 hover:text-red-800">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <AnimatePresence mode="wait">

        {activeTab === 'home' && (
          <motion.div key="home" className="p-10 flex flex-col items-center relative"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <h1 className="text-4xl font-bold mb-8 text-purple-800">भाषा-Vault</h1>

            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse -z-10"></div>
            <div className="absolute top-20 right-0 w-24 h-24 bg-purple-300 rounded-full opacity-20 animate-pulse -z-10"></div>
            <div className="absolute bottom-0 left-20 w-28 h-28 bg-purple-100 rounded-full opacity-25 animate-pulse -z-10"></div>

            <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center gap-6">
              <div className="flex justify-between items-center w-full gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm flex-1">
                  <Book className="text-purple-500" />
                  <select
                    className="w-full text-purple-800 bg-transparent outline-none"
                    value={fromLang}
                    onChange={(e) => setFromLang(e.target.value)}
                  >
                    {languages.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <span onClick={swapLanguages} className="text-lg font-semibold text-purple-700 cursor-pointer">⇄</span>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm flex-1">
                  <Star className="text-purple-500" />
                  <select
                    className="w-full text-purple-800 bg-transparent outline-none"
                    value={toLang}
                    onChange={(e) => setToLang(e.target.value)}
                  >
                    {languages.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative w-full">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Type your word..."
                  className="border w-full px-4 py-3 rounded-xl text-center shadow-md focus:ring-2 focus:ring-purple-300 text-purple-800 bg-white placeholder-purple-400 transition"
                />
                <SpeechToText
                  setInputWord={setInputWord}
                  handleSearch={handleSearch}
                  lang={fromLang}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((item, i) => (
                      <div
                        key={i}
                        className="p-2 cursor-pointer hover:bg-purple-100 text-purple-800"
                        onClick={() => {
                          setInputWord(item[fromLang]);
                          setShowSuggestions(false);
                          setSuggestions([]);
                        }}
                      >
                        {item[fromLang]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="w-full bg-purple-200 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-300 transition"
              >
                {showKeyboard ? 'Hide' : 'Show'} Keyboard
              </button>

              {showKeyboard && (
                <div className="grid grid-cols-10 gap-2 mt-4 bg-purple-50 p-4 rounded-xl shadow-inner">
                  {devanagariKeys.map((char, i) => (
                    <button
                      key={i}
                      onClick={() => handleKeyboardInput(char)}
                      className="text-lg bg-purple-100 hover:bg-purple-300 rounded-md p-2 transition"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleSearch}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition transform hover:-translate-y-1 hover:scale-105"
              >
                Translate
              </button>

              {outputWord && outputWord !== 'Word not found in dictionary' && (
                <div className="mt-4 w-full bg-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-medium text-purple-800">{outputWord}</p>
                    <TextToSpeech 
                      text={outputWord.split(' → ')[1]} 
                      language={toLang}
                    />
                  </div>
                  <button
                    onClick={() => handleBookmark(outputWord)}
                    className="mt-2 text-purple-600 hover:underline"
                  >
                    Bookmark
                  </button>
                </div>
              )}

              {outputWord === 'Word not found in dictionary' && (
                <div className="mt-4 w-full bg-white p-4 rounded-xl shadow-md text-center">
                  <p className="text-xl font-medium text-purple-800">{outputWord}</p>
                </div>
              )}
            </div>

            <p className="mt-6 text-purple-700 text-center text-lg font-medium">
              Choose your translation languages and explore words across cultures 🌏
            </p>

            <div style={{ marginTop: "50px", width: "100%" }}>
              <Chatbot />
            </div>

          </motion.div>
        )}

        {activeTab === 'bookmarks' && (
          <motion.div key="bookmarks" className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">Bookmarked Words</h2>
            {bookmarks.length === 0 ? <p className="text-purple-700">No bookmarks yet.</p> : (
              <ul className="space-y-2">
                {bookmarks.map((w, i) => {
                  const parts = w.split(' → ');
                  const translatedWord = parts[1] || w;
                  return (
                    <li key={i} className="flex justify-between items-center bg-purple-50 p-3 rounded-lg shadow-sm hover:bg-purple-100 transition">
                      <span className="text-purple-800">{w}</span>
                      <div className="flex items-center gap-2">
                        <TextToSpeech text={translatedWord} language={toLang} />
                        <button onClick={() => deleteBookmark(w)} className="text-red-500 hover:text-red-700">
                          <X size={18} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">Search History</h2>
            {history.length === 0 ? <p className="text-purple-700">No searches yet.</p> : (
              <div className="space-y-4">
                {history.map((w, i) => {
                  const parts = w.split(' → ');
                  const translatedWord = parts[1] || w;
                  return (
                    <div key={i} className="bg-purple-50 p-3 rounded-lg shadow-sm hover:bg-purple-100 transition flex justify-between items-center">
                      <p className="text-purple-800">{w}</p>
                      <TextToSpeech text={translatedWord} language={toLang} />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'word' && wordOfDay && (
          <motion.div key="word" className="p-10 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 p-6 rounded-xl shadow-lg w-[28rem] text-center">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Word of the Day</h2>
              <div className="bg-white p-4 rounded-lg shadow mb-4 flex justify-between items-center">
                <p className="text-2xl font-bold text-purple-900">{wordOfDay.English}</p>
                <TextToSpeech text={wordOfDay.English} language="English" />
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-md shadow text-purple-700 text-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Hindi:</span> {wordOfDay.Hindi}
                  </div>
                  <TextToSpeech text={wordOfDay.Hindi} language="Hindi" />
                </div>
                <div className="bg-white p-3 rounded-md shadow text-purple-700 text-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Marathi:</span> {wordOfDay.Marathi}
                  </div>
                  <TextToSpeech text={wordOfDay.Marathi} language="Marathi" />
                </div>
                <div className="bg-white p-3 rounded-md shadow text-purple-700 text-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Sanskrit:</span> {wordOfDay.Sanskrit}
                  </div>
                  <TextToSpeech text={wordOfDay.Sanskrit} language="Sanskrit" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div key="about" className="p-10 flex flex-col items-center relative"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <h2 className="text-4xl font-bold mb-8 text-purple-800">About Bhasha-Vault</h2>

            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse -z-10"></div>
            <div className="absolute top-20 right-0 w-24 h-24 bg-purple-300 rounded-full opacity-20 animate-pulse -z-10"></div>
            <div className="absolute bottom-0 left-20 w-28 h-28 bg-purple-100 rounded-full opacity-25 animate-pulse -z-10"></div>

            <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 p-8 rounded-2xl shadow-lg w-full max-w-3xl text-purple-800 space-y-4">
              <p className="text-lg">
                Bhasha-Vault is a multilingual dictionary app designed to bridge language gaps and make learning new words fun and interactive. You can translate words between English, Hindi, Marathi, and Sanskrit.
              </p>
              <p className="text-lg font-semibold">Features include:</p>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>Instant word translation between multiple languages</li>
                <li>Speech-to-text input for supported languages (English, Marathi, Hindi)</li>
                <li>Text-to-speech pronunciation for all languages</li>
                <li>Save favorite words with bookmarks</li>
                <li>View your search history</li>
                <li>Explore a new word every day with Word of the Day</li>
              </ul>
              <p className="text-lg">
                This project is designed for <span className="font-semibold">Kaushiki Innovations</span>. The goal is to teach students languages using a domain-specific healthcare dictionary available in four languages.
              </p>
              <p className="text-lg">
                <span className="font-semibold">Kaushiki Innovision</span> conducts research, trials, rigorous experimentation, and testing to develop robust, ruggedized solutions for real-world applications.
              </p>
              <p className="text-lg">
                Our goal is to make multilingual learning accessible and enjoyable for everyone. 🌏
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}