/**
 * Enhanced Rate Limiting Middleware for SealKloud API
 * Provides different rate limits based on endpoint and user role
 */

import rateLimit from 'express-rate-limit';
import { createError, ERROR_CODES } from './errorHandler.js';

// Rate limit configurations
const RATE_LIMITS = {
  // General API limits
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Authentication endpoints (more restrictive)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // Ticket creation (prevent spam)
  TICKET_CREATE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 tickets per hour
    message: 'Too many ticket creation attempts, please try again later.'
  },
  
  // File uploads (prevent abuse)
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 file uploads per hour
    message: 'Too many file upload attempts, please try again later.'
  },
  
  // Search endpoints (prevent excessive queries)
  SEARCH: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 searches per 5 minutes
    message: 'Too many search requests, please try again later.'
  },
  
  // Admin endpoints (higher limits for admins)
  ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: 'Too many admin requests, please try again later.'
  }
};

/**
 * Create a rate limiter with custom configuration
 * @param {Object} config - Rate limit configuration
 * @param {string} name - Name for the rate limiter
 * @returns {Function} Express middleware
 */
const createRateLimiter = (config, name) => {
  return rateLimit({
    ...config,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      const error = createError(ERROR_CODES.RATE_LIMIT_EXCEEDED, config.message);
      res.status(429).json(error);
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `${req.user.id}:${name}` : req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
};

// Create rate limiters
export const generalLimiter = createRateLimiter(RATE_LIMITS.GENERAL, 'general');
export const authLimiter = createRateLimiter(RATE_LIMITS.AUTH, 'auth');
export const ticketCreateLimiter = createRateLimiter(RATE_LIMITS.TICKET_CREATE, 'ticket-create');
export const fileUploadLimiter = createRateLimiter(RATE_LIMITS.FILE_UPLOAD, 'file-upload');
export const searchLimiter = createRateLimiter(RATE_LIMITS.SEARCH, 'search');
export const adminLimiter = createRateLimiter(RATE_LIMITS.ADMIN, 'admin');

/**
 * Dynamic rate limiter based on user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const dynamicRateLimiter = (req, res, next) => {
  // Get user role from request
  const userRole = req.user?.role;
  
  // Apply different limits based on role
  if (userRole === 'admin') {
    return adminLimiter(req, res, next);
  } else if (userRole === 'employee_l3') {
    // L3 employees get higher limits
    const l3Limiter = createRateLimiter({
      ...RATE_LIMITS.GENERAL,
      max: 150
    }, 'l3-employee');
    return l3Limiter(req, res, next);
  } else if (userRole === 'employee_l2') {
    // L2 employees get standard limits
    return generalLimiter(req, res, next);
  } else if (userRole === 'employee_l1') {
    // L1 employees get slightly lower limits
    const l1Limiter = createRateLimiter({
      ...RATE_LIMITS.GENERAL,
      max: 80
    }, 'l1-employee');
    return l1Limiter(req, res, next);
  } else {
    // Clients get the most restrictive limits
    const clientLimiter = createRateLimiter({
      ...RATE_LIMITS.GENERAL,
      max: 50
    }, 'client');
    return clientLimiter(req, res, next);
  }
};

/**
 * Burst rate limiter for critical operations
 * Prevents sudden spikes in requests
 */
export const burstLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests in a short time, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = createError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests in a short time, please slow down.');
    res.status(429).json(error);
  }
});

/**
 * Maintenance mode middleware
 * Can be used to temporarily disable API access
 */
export const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    const error = createError(ERROR_CODES.MAINTENANCE_MODE, 'Service is currently under maintenance. Please try again later.');
    return res.status(503).json(error);
  }
  next();
};

export default {
  generalLimiter,
  authLimiter,
  ticketCreateLimiter,
  fileUploadLimiter,
  searchLimiter,
  adminLimiter,
  dynamicRateLimiter,
  burstLimiter,
  maintenanceMode
}; 