/**
 * Admin Guard
 * ===========
 * Verifies if the current user has admin privileges.
 * Uses environment variable for admin email configuration.
 * 
 * Does NOT block preview or normal users incorrectly.
 */

import { getFirebaseAuth } from '@/lib/firebase';

// Admin email from environment variable (placeholder)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'ADMIN_EMAIL_PLACEHOLDER';

export interface AdminCheckResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  error: string | null;
}

/**
 * Check if the current user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const auth = getFirebaseAuth();
  if (!auth) {
    // Firebase not configured - allow preview mode
    console.warn('[AdminGuard] Firebase not available. Preview mode active.');
    return false;
  }
  return auth.currentUser !== null;
};

/**
 * Check if the current user is an admin
 */
export const isCurrentUserAdmin = (): AdminCheckResult => {
  const auth = getFirebaseAuth();
  
  // Firebase not configured - allow preview/development mode
  if (!auth) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      userEmail: null,
      error: 'Firebase not configured. Running in preview mode.',
    };
  }

  const currentUser = auth.currentUser;

  // No user logged in
  if (!currentUser) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      userEmail: null,
      error: null,
    };
  }

  const userEmail = currentUser.email?.toLowerCase() || null;
  const adminEmail = ADMIN_EMAIL.toLowerCase();
  
  // Check if admin email is configured
  if (adminEmail === 'admin_email_placeholder') {
    console.warn('[AdminGuard] Admin email not configured.');
    return {
      isAuthenticated: true,
      isAdmin: false,
      userEmail,
      error: 'Admin email not configured.',
    };
  }

  const isAdmin = userEmail === adminEmail;

  return {
    isAuthenticated: true,
    isAdmin,
    userEmail,
    error: null,
  };
};

/**
 * Admin guard for routes - use in route protection
 * Returns true if user should have access, false otherwise
 */
export const canAccessAdminRoute = (): boolean => {
  const result = isCurrentUserAdmin();
  return result.isAdmin;
};

/**
 * Get current user email
 */
export const getCurrentUserEmail = (): string | null => {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return null;
  return auth.currentUser.email;
};

/**
 * Check admin status with async user state
 * Useful when auth state might not be immediately available
 */
export const checkAdminStatusAsync = (): Promise<AdminCheckResult> => {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    
    if (!auth) {
      resolve({
        isAuthenticated: false,
        isAdmin: false,
        userEmail: null,
        error: 'Firebase not configured.',
      });
      return;
    }

    // Use onAuthStateChanged to ensure we get the current state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe immediately after getting the state
      
      if (!user) {
        resolve({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          error: null,
        });
        return;
      }

      const userEmail = user.email?.toLowerCase() || null;
      const adminEmail = ADMIN_EMAIL.toLowerCase();
      const isAdmin = adminEmail !== 'admin_email_placeholder' && userEmail === adminEmail;

      resolve({
        isAuthenticated: true,
        isAdmin,
        userEmail,
        error: null,
      });
    });
  });
};
