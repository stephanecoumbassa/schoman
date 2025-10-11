import { Request, Response, NextFunction } from 'express';

/**
 * Security Middleware
 * Provides various security enhancements without external dependencies
 */

/**
 * Security headers middleware
 * Adds essential security headers to responses
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS (Strict-Transport-Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );
  
  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};

/**
 * CSRF Token validation middleware
 * Validates CSRF token for state-changing operations
 */
export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
      statusCode: 403,
    });
  }
  
  next();
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Input sanitization middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * IP-based rate limiting tracker
 */
const ipAttempts = new Map<string, { count: number; resetTime: number }>();

/**
 * Login attempt tracking middleware
 * Tracks failed login attempts by IP
 */
export const trackLoginAttempts = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = ipAttempts.get(ip);
  
  if (attempts && attempts.count >= 5) {
    // Check if cooldown period has passed (15 minutes)
    if (now < attempts.resetTime) {
      const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60);
      return res.status(429).json({
        message: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
        statusCode: 429,
      });
    } else {
      // Reset after cooldown
      ipAttempts.delete(ip);
    }
  }
  
  next();
};

/**
 * Record failed login attempt
 */
export const recordFailedLogin = (req: Request) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const cooldownPeriod = 15 * 60 * 1000; // 15 minutes
  
  const attempts = ipAttempts.get(ip);
  
  if (attempts) {
    attempts.count++;
    attempts.resetTime = now + cooldownPeriod;
  } else {
    ipAttempts.set(ip, {
      count: 1,
      resetTime: now + cooldownPeriod,
    });
  }
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (req: Request) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  ipAttempts.delete(ip);
};

/**
 * Password strength validator
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  securityHeaders,
  validateCSRFToken,
  generateCSRFToken,
  sanitizeInput,
  trackLoginAttempts,
  recordFailedLogin,
  clearLoginAttempts,
  validatePasswordStrength,
};
