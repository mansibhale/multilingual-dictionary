import React, { useState } from "react";

function Chatbot() {
  const [word, setWord] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

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


      setResponse(`
 Word: ${word}
 Synonyms: ${synonyms}
 Antonyms: ${antonyms}
 Example (EN): ${example}

 Hindi: ${translations["hi"]}
 Marathi: ${translations["mr"]}
 Sanskrit: ${translations["sa"]}
      `);
    } catch (err) {
      setResponse("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🧠 Synonym & Antonym Chatbot</h2>
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter an English word"
        style={{ padding: "10px", width: "60%", marginRight: "10px" }}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Loading..." : "Search"}
      </button>
      <pre
        style={{
          textAlign: "left",
          background: "#f4f4f4",
          padding: "15px",
          marginTop: "20px",
          borderRadius: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        {response}
      </pre>
    </div>
  );
}

export default Chatbot;
