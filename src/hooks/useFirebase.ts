/**
 * Firebase Hook
 * =============
 * React hook for accessing Firebase services safely.
 * Provides graceful fallback when Firebase is not configured.
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  getFirebaseAuth, 
  getFirebaseFirestore, 
  isFirebaseConfigured,
  getFirebaseStatus 
} from '@/lib/firebase';

export interface FirebaseState {
  isConfigured: boolean;
  isInitialized: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to access Firebase state and services
 */
export const useFirebase = (): FirebaseState => {
  const [state, setState] = useState<FirebaseState>({
    isConfigured: isFirebaseConfigured(),
    isInitialized: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();

    // Firebase not configured - stop loading
    if (!auth) {
      setState((prev) => ({
        ...prev,
        loading: false,
        isInitialized: false,
      }));
      return;
    }

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setState((prev) => ({
          ...prev,
          user,
          loading: false,
          isInitialized: true,
          error: null,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  return state;
};

/**
 * Hook to check if user is authenticated
 */
export const useAuth = () => {
  const { user, loading, isConfigured } = useFirebase();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    isFirebaseReady: isConfigured,
  };
};

/**
 * Hook to get Firestore instance
 */
export const useFirestore = () => {
  const [db, setDb] = useState(getFirebaseFirestore());
  const [isReady, setIsReady] = useState(!!db);

  useEffect(() => {
    const firestore = getFirebaseFirestore();
    setDb(firestore);
    setIsReady(!!firestore);
  }, []);

  return { db, isReady };
};

/**
 * Hook to get Firebase status
 */
export const useFirebaseStatus = () => {
  const [status, setStatus] = useState(getFirebaseStatus());

  useEffect(() => {
    // Update status periodically
    const interval = setInterval(() => {
      setStatus(getFirebaseStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
};

export default useFirebase;
