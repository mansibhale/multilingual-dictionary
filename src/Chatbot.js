import React, { useState } from "react";
import { Search, BookOpen, Sparkles, Globe, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Chatbot() {
  const [word, setWord] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);

    try {
      // 1️⃣ Get synonyms & antonyms from Datamuse API (free)
      const dataMuse = await fetch(`https://api.datamuse.com/words?ml=${word}`).then(res => res.json());
      const dataMuseAnt = await fetch(`https://api.datamuse.com/words?rel_ant=${word}`).then(res => res.json());

      const synonyms = dataMuse.slice(0, 5).map(w => w.word).join(", ") || "Not found";
      const antonyms = dataMuseAnt.slice(0, 5).map(w => w.word).join(", ") || "Not found";

      // 2️⃣ Get example sentence
      const exampleRes = await fetch(`https://api.datamuse.com/words?sp=${word}&qe=sp&md=d`).then(res => res.json());
      const example =
        exampleRes[0]?.defs?.[0]?.split("\t")[1] || `Example for "${word}" not found.`;

      // 3️⃣ Translate using MyMemory API (supports hi, mr, sa)
      const langs = {
        hi: "hi", // Hindi
        mr: "mr", // Marathi
        sa: "sa"  // Sanskrit
      };
      const translations = {};

      for (let [code, langName] of Object.entries(langs)) {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(example)}&langpair=en|${code}`
        );
        const json = await res.json();
        translations[code] = json?.responseData?.translatedText || "Not available";
      }

      setResponse({
        word,
        synonyms,
        antonyms,
        example,
        translations
      });
    } catch (err) {
      setResponse({
        error: "Error fetching data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <>
      {/* Floating Open Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-110 flex items-center gap-2"
            title="Open Word Explorer"
          >
            <BookOpen size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-6 left-6 w-[450px] max-h-[700px] bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-purple-300 p-2 rounded-full">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Word Explorer</h3>
                  <p className="text-xs text-purple-100">Synonyms, Antonyms & Translations</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-purple-400 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Floating bubbles */}
            <div className="absolute top-24 right-4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse pointer-events-none -z-10"></div>
            <div className="absolute bottom-40 left-4 w-16 h-16 bg-purple-300 rounded-full opacity-20 animate-pulse pointer-events-none -z-10"></div>

            {/* Search Area */}
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter an English word..."
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none bg-white text-purple-800 placeholder-purple-400 shadow-sm transition"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !word.trim()}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 font-semibold flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-purple-600 text-center">
                Discover synonyms, antonyms, and multilingual examples! 🌟
              </p>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {response && !response.error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Word Header */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-md text-center">
                    <h3 className="text-2xl font-bold">{response.word}</h3>
                  </div>

                  {/* Synonyms */}
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="text-purple-500" size={20} />
                      <h4 className="font-bold text-purple-800">Synonyms</h4>
                    </div>
                    <p className="text-purple-700">{response.synonyms}</p>
                  </div>

                  {/* Antonyms */}
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="text-purple-500" size={20} />
                      <h4 className="font-bold text-purple-800">Antonyms</h4>
                    </div>
                    <p className="text-purple-700">{response.antonyms}</p>
                  </div>

                  {/* Example */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-purple-600" size={20} />
                      <h4 className="font-bold text-purple-800">Example (English)</h4>
                    </div>
                    <p className="text-purple-800 italic">"{response.example}"</p>
                  </div>

                  {/* Translations */}
                  <div className="bg-white p-4 rounded-xl shadow-md space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="text-purple-500" size={20} />
                      <h4 className="font-bold text-purple-800">Translations</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-semibold text-purple-700">Hindi:</span>
                        <p className="text-purple-800 mt-1">{response.translations.hi}</p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-semibold text-purple-700">Marathi:</span>
                        <p className="text-purple-800 mt-1">{response.translations.mr}</p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-semibold text-purple-700">Sanskrit:</span>
                        <p className="text-purple-800 mt-1">{response.translations.sa}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {response && response.error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl text-center"
                >
                  <p className="font-semibold">{response.error}</p>
                </motion.div>
              )}

              {!response && !loading && (
                <div className="text-center text-purple-600 py-12">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Enter a word to explore its meanings,</p>
                  <p className="text-lg">synonyms, and translations!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;