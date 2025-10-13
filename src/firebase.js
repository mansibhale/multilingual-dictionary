import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <-- add GoogleAuthProvider
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiil_fmXGK9aBsfc98YbG06OEQgoJ-1OA",
  authDomain: "multilingual-dictionary-a3a63.firebaseapp.com",
  projectId: "multilingual-dictionary-a3a63",
  storageBucket: "multilingual-dictionary-a3a63.firebasestorage.app",
  messagingSenderId: "56088406059",
  appId: "1:56088406059:web:4f55e71420d9da76caa26e",
  measurementId: "G-GE5DF6HFEW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google login provider
export const googleProvider = new GoogleAuthProvider(); // now this will work
