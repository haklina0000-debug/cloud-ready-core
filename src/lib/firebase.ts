// Firebase core
import { initializeApp } from "firebase/app";

// Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ===============================
// Firebase configuration
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBjBTHe4tcHrVyBq9ACHt_XeYTvrkhRPT8",
  authDomain: "ntfly-web.firebaseapp.com",
  projectId: "ntfly-web",
  storageBucket: "ntfly-web.firebasestorage.app",
  messagingSenderId: "725624317142",
  appId: "1:725624317142:web:f2744bfb4ed4271f799577",
  measurementId: "G-71HTBZD757",
};

// ===============================
// Initialize Firebase App
// ===============================
export const app = initializeApp(firebaseConfig);

// ===============================
// Initialize Services
// ===============================
export const auth = getAuth(app);
export const db = getFirestore(app);

// ===============================
// Analytics (Safe for Netlify)
// ===============================
export let analytics: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
