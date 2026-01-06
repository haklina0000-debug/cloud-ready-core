/**
 * Firebase Configuration File
 * =============================
 * This file initializes Firebase services with environment variables.
 * All values are placeholders - fill them in .env file before deployment.
 * 
 * The app will work without Firebase (graceful fallback).
 */

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Singleton instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase App
 * Returns null if not configured (graceful fallback)
 */
const initializeFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Not configured. Running in offline mode.');
    return null;
  }

  try {
    // Check if already initialized
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
    console.log('[Firebase] Initialized successfully.');
    return app;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return null;
  }
};

/**
 * Get Firebase Auth instance
 * Returns null if Firebase is not configured
 */
export const getFirebaseAuth = (): Auth | null => {
  if (auth) return auth;
  
  const firebaseApp = initializeFirebaseApp();
  if (!firebaseApp) return null;

  try {
    auth = getAuth(firebaseApp);
    return auth;
  } catch (error) {
    console.error('[Firebase Auth] Failed to initialize:', error);
    return null;
  }
};

/**
 * Get Firestore instance
 * Returns null if Firebase is not configured
 */
export const getFirebaseFirestore = (): Firestore | null => {
  if (db) return db;

  const firebaseApp = initializeFirebaseApp();
  if (!firebaseApp) return null;

  try {
    db = getFirestore(firebaseApp);
    return db;
  } catch (error) {
    console.error('[Firestore] Failed to initialize:', error);
    return null;
  }
};

/**
 * Get Analytics instance (async due to browser support check)
 * Returns null if not supported or not configured
 */
export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (analytics) return analytics;

  const firebaseApp = initializeFirebaseApp();
  if (!firebaseApp) return null;

  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(firebaseApp);
      return analytics;
    }
    console.warn('[Analytics] Not supported in this environment.');
    return null;
  } catch (error) {
    console.error('[Analytics] Failed to initialize:', error);
    return null;
  }
};

/**
 * Check if Firebase is available and configured
 */
export const isFirebaseAvailable = (): boolean => {
  return isFirebaseConfigured() && app !== null;
};

/**
 * Get Firebase configuration status
 */
export const getFirebaseStatus = () => ({
  configured: isFirebaseConfigured(),
  initialized: app !== null,
  authReady: auth !== null,
  firestoreReady: db !== null,
  analyticsReady: analytics !== null,
});

// Export config check utility
export { isFirebaseConfigured };
