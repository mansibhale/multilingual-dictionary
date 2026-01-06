import React, { useState } from 'react';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // LOGIN
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('User not found. Please create an account.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message);
      }
    }
  };

  // SIGN UP (AUTO REGISTER USER)
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Create Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        bookmarks: [],
        history: [],
        encrypted: true,
        createdAt: new Date().toISOString()
      });

      alert('Account created successfully! You can now login.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-purple-500 text-white py-3 rounded"
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-3 rounded mt-2"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
