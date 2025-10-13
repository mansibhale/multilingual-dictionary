import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import Login from "./login";
import MultilingualDictionaryApp from "./MultilingualDictionaryApp";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p>Loading...</p>; // optional loading screen

  return user ? <MultilingualDictionaryApp /> : <Login />;
}
