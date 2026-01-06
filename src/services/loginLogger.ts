/**
 * Login Logger Service
 * ====================
 * Tracks user login events for analytics and security.
 * Currently stores in memory - ready to connect to database later.
 * 
 * Does NOT require database connection to function.
 */

export type LoginType = 'user' | 'admin' | 'guest';

export interface LoginEvent {
  id: string;
  timestamp: Date;
  loginType: LoginType;
  userEmail: string | null;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

// In-memory storage for login events (replace with database later)
const loginEvents: LoginEvent[] = [];

// Maximum events to keep in memory
const MAX_EVENTS_IN_MEMORY = 100;

/**
 * Generate unique ID for login event
 */
const generateEventId = (): string => {
  return `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current user agent
 */
const getUserAgent = (): string => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent;
  }
  return 'unknown';
};

/**
 * Log a login event
 */
export const logLoginEvent = (
  loginType: LoginType,
  userEmail: string | null,
  success: boolean,
  metadata?: Record<string, unknown>
): LoginEvent => {
  const event: LoginEvent = {
    id: generateEventId(),
    timestamp: new Date(),
    loginType,
    userEmail,
    userAgent: getUserAgent(),
    success,
    metadata,
  };

  // Add to in-memory storage
  loginEvents.unshift(event);

  // Limit memory usage
  if (loginEvents.length > MAX_EVENTS_IN_MEMORY) {
    loginEvents.pop();
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[LoginLogger] Event recorded:', {
      type: loginType,
      email: userEmail,
      success,
      time: event.timestamp.toISOString(),
    });
  }

  return event;
};

/**
 * Log successful user login
 */
export const logUserLogin = (userEmail: string): LoginEvent => {
  return logLoginEvent('user', userEmail, true);
};

/**
 * Log successful admin login
 */
export const logAdminLogin = (adminEmail: string): LoginEvent => {
  return logLoginEvent('admin', adminEmail, true, { role: 'admin' });
};

/**
 * Log failed login attempt
 */
export const logFailedLogin = (
  attemptedEmail: string | null,
  reason?: string
): LoginEvent => {
  return logLoginEvent('user', attemptedEmail, false, { reason });
};

/**
 * Log guest/anonymous access
 */
export const logGuestAccess = (): LoginEvent => {
  return logLoginEvent('guest', null, true);
};

/**
 * Get all login events (from memory)
 */
export const getLoginEvents = (): LoginEvent[] => {
  return [...loginEvents];
};

/**
 * Get login events by type
 */
export const getLoginEventsByType = (type: LoginType): LoginEvent[] => {
  return loginEvents.filter((event) => event.loginType === type);
};

/**
 * Get login events for a specific user
 */
export const getLoginEventsForUser = (email: string): LoginEvent[] => {
  return loginEvents.filter(
    (event) => event.userEmail?.toLowerCase() === email.toLowerCase()
  );
};

/**
 * Get failed login attempts
 */
export const getFailedLoginAttempts = (): LoginEvent[] => {
  return loginEvents.filter((event) => !event.success);
};

/**
 * Get login events from the last N hours
 */
export const getRecentLoginEvents = (hours: number = 24): LoginEvent[] => {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  
  return loginEvents.filter((event) => event.timestamp >= cutoff);
};

/**
 * Clear all login events from memory
 * (For testing or memory management)
 */
export const clearLoginEvents = (): void => {
  loginEvents.length = 0;
};

/**
 * Get login statistics
 */
export const getLoginStats = () => {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentEvents = loginEvents.filter((e) => e.timestamp >= last24Hours);

  return {
    totalEventsInMemory: loginEvents.length,
    last24Hours: {
      total: recentEvents.length,
      successful: recentEvents.filter((e) => e.success).length,
      failed: recentEvents.filter((e) => !e.success).length,
      adminLogins: recentEvents.filter((e) => e.loginType === 'admin').length,
      userLogins: recentEvents.filter((e) => e.loginType === 'user').length,
      guestAccess: recentEvents.filter((e) => e.loginType === 'guest').length,
    },
  };
};
