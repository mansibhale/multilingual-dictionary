// src/Login.js
import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-purple-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded text-purple-700 focus:ring-2 focus:ring-purple-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded text-purple-700 focus:ring-2 focus:ring-purple-300"
        />

        <button
          onClick={handleEmailLogin}
          className="w-full bg-purple-500 text-white px-4 py-3 rounded mb-3 hover:bg-purple-600 transition"
        >
          Login with Email
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
