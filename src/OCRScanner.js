// src/components/OCRScanner.js
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function OCRScanner({ onTextExtracted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      onTextExtracted(text);
    } catch (err) {
      setError('Failed to extract text.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
      {loading && <p>Extracting text...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
