import React, { useState, useEffect } from 'react';
import { Book, Star, Clock, Home, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultilingualDictionaryApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Hindi');
  const [inputWord, setInputWord] = useState('');
  const [outputWord, setOutputWord] = useState('');
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [wordOfDay, setWordOfDay] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const devanagariKeys = [
    '\u0915', '\u0916', '\u0917', '\u0918', '\u091A', '\u091B', '\u091C', '\u091D', '\u091E',
    '\u091F', '\u0920', '\u0921', '\u0922', '\u0923', '\u0924', '\u0925', '\u0926', '\u0927',
    '\u0928', '\u092A', '\u092B', '\u092E', '\u092F', '\u0930', '\u0932', '\u0935', '\u0936', '\u0937', '\u0938', '\u0939'
  ];

  const languages = ['English', 'Hindi', 'Marathi', 'Sanskrit'];

  useEffect(() => {
    const words = ['ज्ञान (Gyaan)', 'शक्ति (Shakti)', 'प्रेम (Prem)', 'धैर्य (Dhairya)', 'सत्य (Satya)'];
    setWordOfDay(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleSearch = () => {
    if (inputWord.trim() === '') return;
    const result = `${inputWord} → ${toLang}`;
    setOutputWord(result);
    setHistory([result, ...history]);
  };

  const handleBookmark = (word) => {
    if (!bookmarks.includes(word)) setBookmarks([...bookmarks, word]);
  };

  const handleKeyboardInput = (char) => {
    setInputWord(prev => prev + char);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 font-sans">
      {/* Navbar */}
      <nav className="flex justify-around bg-white shadow-md py-4 sticky top-0 z-50">
        {[{ id: 'home', icon: <Home />, label: 'Home' },
          { id: 'search', icon: <Search />, label: 'Search' },
          { id: 'bookmarks', icon: <Star />, label: 'Bookmarks' },
          { id: 'history', icon: <Clock />, label: 'History' },
          { id: 'word', icon: <Sparkles />, label: 'Word of the Day' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === tab.id ? 'bg-indigo-200 text-indigo-700' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* Home Tab */}
      {activeTab === 'home' && (
        <motion.div className="p-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-6 text-indigo-700">Multilingual Dictionary</h1>
          <div className="flex justify-center gap-4 mb-6">
            <select className="border rounded-lg px-4 py-2" value={fromLang} onChange={(e) => setFromLang(e.target.value)}>
              {languages.map(l => <option key={l}>{l}</option>)}
            </select>
            <span className="text-lg font-semibold">→</span>
            <select className="border rounded-lg px-4 py-2" value={toLang} onChange={(e) => setToLang(e.target.value)}>
              {languages.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <p className="text-gray-600">Choose your translation languages and explore words across cultures 🌏</p>
        </motion.div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Type your word..."
              className="border w-80 px-4 py-2 rounded-lg text-center shadow-sm"
            />
            <div className="flex gap-4">
              <button onClick={handleSearch} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">Search</button>
              <button onClick={() => setShowKeyboard(!showKeyboard)} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">{showKeyboard ? 'Hide' : 'Show'} Keyboard</button>
            </div>
            {showKeyboard && (
              <div className="grid grid-cols-10 gap-2 mt-4 bg-white p-4 rounded-xl shadow-md">
                {devanagariKeys.map((char, i) => (
                  <button key={i} onClick={() => handleKeyboardInput(char)} className="text-lg bg-gray-100 hover:bg-indigo-200 rounded-md p-2">{char}</button>
                ))}
              </div>
            )}
            {outputWord && (
              <div className="mt-6 p-4 bg-white shadow rounded-lg w-96 text-center">
                <p className="text-xl font-medium">{outputWord}</p>
                <button onClick={() => handleBookmark(outputWord)} className="mt-2 text-indigo-600 hover:underline">Bookmark</button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Bookmarked Words</h2>
          {bookmarks.length === 0 ? <p className="text-gray-500">No bookmarks yet.</p> : (
            <ul className="list-disc list-inside space-y-2">
              {bookmarks.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Search History</h2>
          {history.length === 0 ? <p className="text-gray-500">No searches yet.</p> : (
            <ul className="list-decimal list-inside space-y-2">
              {history.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </motion.div>
      )}

      {/* Word of the Day */}
      {activeTab === 'word' && (
        <motion.div className="p-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Word of the Day 🌟</h2>
          <p className="text-xl bg-white inline-block px-6 py-3 rounded-lg shadow-md">{wordOfDay}</p>
        </motion.div>
      )}
    </div>
  );
}
