/**
 * Security Service
 * ================
 * Provides input sanitization and file validation.
 */

import { z } from 'zod';

// Dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.vbs', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1', '.reg', '.inf', '.scf',
  '.hta', '.cpl', '.msc', '.jar', '.vb', '.vbe',
];

// Allowed file extensions for uploads
const ALLOWED_EXTENSIONS = [
  '.html', '.css', '.js', '.ts', '.tsx', '.jsx',
  '.json', '.md', '.txt', '.svg', '.png', '.jpg',
  '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff',
  '.woff2', '.ttf', '.eot',
];

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,     // 5MB
  document: 10 * 1024 * 1024, // 10MB
  code: 1 * 1024 * 1024,      // 1MB
  default: 2 * 1024 * 1024,   // 2MB
};

/**
 * Validation schemas
 */
export const emailSchema = z.string()
  .trim()
  .email({ message: 'البريد الإلكتروني غير صالح' })
  .max(255, { message: 'البريد الإلكتروني طويل جداً' });

export const passwordSchema = z.string()
  .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  .max(128, { message: 'كلمة المرور طويلة جداً' })
  .regex(/[A-Z]/, { message: 'يجب أن تحتوي على حرف كبير' })
  .regex(/[a-z]/, { message: 'يجب أن تحتوي على حرف صغير' })
  .regex(/[0-9]/, { message: 'يجب أن تحتوي على رقم' });

export const usernameSchema = z.string()
  .trim()
  .min(3, { message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' })
  .max(30, { message: 'اسم المستخدم طويل جداً' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'يجب أن يحتوي على حروف وأرقام و _ فقط' });

export const projectNameSchema = z.string()
  .trim()
  .min(1, { message: 'اسم المشروع مطلوب' })
  .max(100, { message: 'اسم المشروع طويل جداً' });

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Sanitize HTML content (basic)
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs in href/src
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*["']data:/gi, ' $1="');
  
  return sanitized;
};

/**
 * Validate file extension
 */
export const isFileExtensionSafe = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  
  // Check if it's a dangerous extension
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  return true;
};

/**
 * Check if file extension is allowed
 */
export const isFileExtensionAllowed = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Validate file size
 */
export const isFileSizeValid = (
  size: number,
  type: 'image' | 'document' | 'code' | 'default' = 'default'
): boolean => {
  return size <= MAX_FILE_SIZES[type];
};

/**
 * Validate file for upload
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateFile = (file: File): FileValidationResult => {
  const errors: string[] = [];
  
  // Check extension safety
  if (!isFileExtensionSafe(file.name)) {
    errors.push('نوع الملف غير مسموح به لأسباب أمنية');
  }
  
  // Check if extension is allowed
  if (!isFileExtensionAllowed(file.name)) {
    errors.push('امتداد الملف غير مدعوم');
  }
  
  // Determine file type category
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  let sizeType: 'image' | 'document' | 'code' | 'default' = 'default';
  
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
    sizeType = 'image';
  } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
    sizeType = 'document';
  } else if (['.js', '.ts', '.tsx', '.jsx', '.html', '.css'].includes(ext)) {
    sizeType = 'code';
  }
  
  // Check file size
  if (!isFileSizeValid(file.size, sizeType)) {
    const maxMB = MAX_FILE_SIZES[sizeType] / (1024 * 1024);
    errors.push(`حجم الملف يتجاوز الحد المسموح (${maxMB}MB)`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Rate limiting helper (client-side)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

/**
 * Get security status
 */
export const getSecurityStatus = () => ({
  allowedExtensions: ALLOWED_EXTENSIONS,
  dangerousExtensions: DANGEROUS_EXTENSIONS,
  maxFileSizes: MAX_FILE_SIZES,
});
