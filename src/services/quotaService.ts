/**
 * Quota Service
 * =============
 * Manages user quotas for projects and resources.
 * Currently uses in-memory storage - ready for database integration.
 * 
 * Does NOT require database connection to function.
 */

export interface QuotaConfig {
  maxProjectsPerDay: number;
  maxStorageMB: number;
  maxApiCallsPerHour: number;
  quotaResetHours: number;
}

export interface UserQuota {
  userId: string;
  projectsCreatedToday: number;
  storageUsedMB: number;
  apiCallsThisHour: number;
  lastProjectCreation: Date | null;
  lastApiCall: Date | null;
  quotaResetAt: Date;
}

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: Date;
  message: string;
}

// Default quota configuration
const DEFAULT_QUOTA_CONFIG: QuotaConfig = {
  maxProjectsPerDay: 5,
  maxStorageMB: 100,
  maxApiCallsPerHour: 100,
  quotaResetHours: 24,
};

// In-memory storage for user quotas
const userQuotas: Map<string, UserQuota> = new Map();

/**
 * Get or create quota for a user
 */
const getOrCreateUserQuota = (userId: string): UserQuota => {
  let quota = userQuotas.get(userId);
  
  if (!quota) {
    const resetAt = new Date();
    resetAt.setHours(resetAt.getHours() + DEFAULT_QUOTA_CONFIG.quotaResetHours);
    
    quota = {
      userId,
      projectsCreatedToday: 0,
      storageUsedMB: 0,
      apiCallsThisHour: 0,
      lastProjectCreation: null,
      lastApiCall: null,
      quotaResetAt: resetAt,
    };
    
    userQuotas.set(userId, quota);
  }
  
  return quota;
};

/**
 * Check if quota needs reset
 */
const checkAndResetQuotaIfNeeded = (quota: UserQuota): UserQuota => {
  const now = new Date();
  
  if (now >= quota.quotaResetAt) {
    // Reset quota
    quota.projectsCreatedToday = 0;
    quota.apiCallsThisHour = 0;
    quota.quotaResetAt = new Date(now.getTime() + DEFAULT_QUOTA_CONFIG.quotaResetHours * 60 * 60 * 1000);
    
    if (import.meta.env.DEV) {
      console.log('[QuotaService] Quota reset for user:', quota.userId);
    }
  }
  
  return quota;
};

/**
 * Check if user can create a new project
 */
export const canCreateProject = (userId: string): QuotaCheckResult => {
  const quota = checkAndResetQuotaIfNeeded(getOrCreateUserQuota(userId));
  const remaining = DEFAULT_QUOTA_CONFIG.maxProjectsPerDay - quota.projectsCreatedToday;
  const allowed = remaining > 0;
  
  return {
    allowed,
    remaining: Math.max(0, remaining),
    limit: DEFAULT_QUOTA_CONFIG.maxProjectsPerDay,
    resetsAt: quota.quotaResetAt,
    message: allowed 
      ? `You can create ${remaining} more project(s) today.`
      : `Daily project limit reached. Resets at ${quota.quotaResetAt.toLocaleTimeString()}.`,
  };
};

/**
 * Record project creation
 */
export const recordProjectCreation = (userId: string): boolean => {
  const checkResult = canCreateProject(userId);
  
  if (!checkResult.allowed) {
    return false;
  }
  
  const quota = getOrCreateUserQuota(userId);
  quota.projectsCreatedToday++;
  quota.lastProjectCreation = new Date();
  
  if (import.meta.env.DEV) {
    console.log('[QuotaService] Project created. User quota:', {
      userId,
      created: quota.projectsCreatedToday,
      limit: DEFAULT_QUOTA_CONFIG.maxProjectsPerDay,
    });
  }
  
  return true;
};

/**
 * Check if user can make API call
 */
export const canMakeApiCall = (userId: string): QuotaCheckResult => {
  const quota = checkAndResetQuotaIfNeeded(getOrCreateUserQuota(userId));
  const remaining = DEFAULT_QUOTA_CONFIG.maxApiCallsPerHour - quota.apiCallsThisHour;
  const allowed = remaining > 0;
  
  return {
    allowed,
    remaining: Math.max(0, remaining),
    limit: DEFAULT_QUOTA_CONFIG.maxApiCallsPerHour,
    resetsAt: quota.quotaResetAt,
    message: allowed
      ? `${remaining} API calls remaining this hour.`
      : `API call limit reached. Please wait.`,
  };
};

/**
 * Record API call
 */
export const recordApiCall = (userId: string): boolean => {
  const checkResult = canMakeApiCall(userId);
  
  if (!checkResult.allowed) {
    return false;
  }
  
  const quota = getOrCreateUserQuota(userId);
  quota.apiCallsThisHour++;
  quota.lastApiCall = new Date();
  
  return true;
};

/**
 * Check storage quota
 */
export const canUseStorage = (userId: string, requiredMB: number): QuotaCheckResult => {
  const quota = getOrCreateUserQuota(userId);
  const available = DEFAULT_QUOTA_CONFIG.maxStorageMB - quota.storageUsedMB;
  const allowed = available >= requiredMB;
  
  return {
    allowed,
    remaining: Math.max(0, available),
    limit: DEFAULT_QUOTA_CONFIG.maxStorageMB,
    resetsAt: quota.quotaResetAt,
    message: allowed
      ? `${available.toFixed(2)} MB storage available.`
      : `Insufficient storage. Need ${requiredMB} MB, have ${available.toFixed(2)} MB.`,
  };
};

/**
 * Record storage usage
 */
export const recordStorageUsage = (userId: string, usedMB: number): boolean => {
  const checkResult = canUseStorage(userId, usedMB);
  
  if (!checkResult.allowed) {
    return false;
  }
  
  const quota = getOrCreateUserQuota(userId);
  quota.storageUsedMB += usedMB;
  
  return true;
};

/**
 * Get user's current quota status
 */
export const getUserQuotaStatus = (userId: string): {
  projects: QuotaCheckResult;
  apiCalls: QuotaCheckResult;
  storage: QuotaCheckResult;
} => {
  return {
    projects: canCreateProject(userId),
    apiCalls: canMakeApiCall(userId),
    storage: canUseStorage(userId, 0),
  };
};

/**
 * Reset user quota (admin function)
 */
export const resetUserQuota = (userId: string): void => {
  userQuotas.delete(userId);
  
  if (import.meta.env.DEV) {
    console.log('[QuotaService] Quota reset for user:', userId);
  }
};

/**
 * Get quota configuration
 */
export const getQuotaConfig = (): QuotaConfig => {
  return { ...DEFAULT_QUOTA_CONFIG };
};

/**
 * Update quota configuration (admin function)
 */
export const updateQuotaConfig = (config: Partial<QuotaConfig>): QuotaConfig => {
  Object.assign(DEFAULT_QUOTA_CONFIG, config);
  return { ...DEFAULT_QUOTA_CONFIG };
};

/**
 * Get all user quotas (admin function)
 */
export const getAllUserQuotas = (): UserQuota[] => {
  return Array.from(userQuotas.values());
};

/**
 * Clear all quotas from memory
 */
export const clearAllQuotas = (): void => {
  userQuotas.clear();
};
