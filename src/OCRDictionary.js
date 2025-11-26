import React, { useState } from 'react';
import OCRScanner from './OCRScanner';

export default function OCRDictionary() {
const [extractedText, setExtractedText] = useState('');
const [results, setResults] = useState([]);

// Inline dictionary lookup using Free Dictionary API
const lookupWord = async (word) => {
try {
const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
const data = await res.json();
return {
word,
meaning: data[0]?.meanings[0]?.definitions[0]?.definition || 'No definition found',
};
} catch (err) {
return { word, meaning: 'Error fetching meaning' };
}
};

const handleTextExtracted = async (text) => {
setExtractedText(text);
const words = text.match(/\b\w+\b/g) || [];
const lookupResults = await Promise.all(words.map(w => lookupWord(w)));
setResults(lookupResults);
};

return ( <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow mt-4"> <h2 className="font-bold text-indigo-700 mb-2">OCR Dictionary Lookup</h2>


  <OCRScanner onTextExtracted={handleTextExtracted} />

  {extractedText && (
    <>
      <h3 className="mt-3 font-semibold text-indigo-600">Extracted Text:</h3>
      <p className="text-indigo-800">{extractedText}</p>
    </>
  )}

  {results.length > 0 && (
    <>
      <h3 className="mt-3 font-semibold text-indigo-600">Dictionary Results:</h3>
      <ul className="list-disc list-inside text-indigo-800">
        {results.map((res, i) => (
          <li key={i}><strong>{res.word}</strong>: {res.meaning}</li>
        ))}
      </ul>
    </>
  )}
</div>

);
}
