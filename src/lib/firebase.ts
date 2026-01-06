// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

/**
 * Firebase configuration
 * (قيم حقيقية أو placeholders – لا يهم الآن)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

/**
 * Initialize app safely
 */
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Firebase services (safe exports)
 */
export const getFirebaseAuth = () => getAuth(app);
export const db = getFirestore(app);

/**
 * Analytics (only in browser)
 */
export const analytics =
  typeof window !== "undefined" && isFirebaseConfigured()
    ? getAnalytics(app)
    : null;

export default app;
