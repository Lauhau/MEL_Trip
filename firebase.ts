import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhdfcG6ONFjii9sZdMn9zLoOA2oaiACG8",
  authDomain: "mel-trip-95837.firebaseapp.com",
  projectId: "mel-trip-95837",
  storageBucket: "mel-trip-95837.firebasestorage.app",
  messagingSenderId: "201385610606",
  appId: "1:201385610606:web:57ab03c06c24fe9ae9057f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);