// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtcKiIN5_f1XxbU7mZ0Uyu6pPaSqMkzJM",
  authDomain: "edu-dashboard-1ca49.firebaseapp.com",
  projectId: "edu-dashboard-1ca49",
  storageBucket: "edu-dashboard-1ca49.firebasestorage.app",
  messagingSenderId: "933933436298",
  appId: "1:933933436298:web:c8b5d8bc1013d1de1f8c73",
  measurementId: "G-17NQSHQJP1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
