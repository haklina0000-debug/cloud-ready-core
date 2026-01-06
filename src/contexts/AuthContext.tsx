/**
 * Auth Context
 * ============
 * Global authentication state management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { logUserLogin, logAdminLogin, logGuestAccess } from '@/services/loginLogger';

// Admin email (hardcoded as requested)
const ADMIN_EMAIL = 'lrsoufyane2007@gmail.com';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFirebaseReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseReady] = useState(isFirebaseConfigured());

  // Convert Firebase user to AuthUser
  const convertUser = (firebaseUser: User | null): AuthUser | null => {
    if (!firebaseUser) return null;
    
    const email = firebaseUser.email?.toLowerCase() || null;
    const isAdmin = email === ADMIN_EMAIL.toLowerCase();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAdmin,
    };
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    if (!auth) {
      // Firebase not configured - allow demo mode
      setLoading(false);
      logGuestAccess();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const authUser = convertUser(firebaseUser);
      setUser(authUser);
      setLoading(false);
      
      // Log login event
      if (authUser) {
        if (authUser.isAdmin) {
          logAdminLogin(authUser.email || '');
        } else {
          logUserLogin(authUser.email || '');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase غير متاح. يرجى تكوين Firebase أولاً.');
      return;
    }

    try {
      setError(null);
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase غير متاح');
      return;
    }

    try {
      setError(null);
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGithub = async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase غير متاح');
      return;
    }

    try {
      setError(null);
      const { GithubAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase غير متاح');
      return;
    }

    try {
      setError(null);
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      await signOut(auth);
    } catch (err: any) {
      setError('فشل تسجيل الخروج');
      throw new Error('فشل تسجيل الخروج');
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isFirebaseReady,
    login,
    loginWithGoogle,
    loginWithGithub,
    signup,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function for error messages
const getAuthErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح',
    'auth/operation-not-allowed': 'العملية غير مسموحة',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/user-disabled': 'الحساب معطل',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور خاطئة',
    'auth/invalid-credential': 'بيانات الاعتماد غير صالحة',
    'auth/too-many-requests': 'محاولات كثيرة. يرجى المحاولة لاحقاً',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
    'auth/cancelled-popup-request': 'تم إلغاء طلب تسجيل الدخول',
  };
  
  return messages[code] || 'حدث خطأ أثناء المصادقة';
};

export default AuthProvider;
