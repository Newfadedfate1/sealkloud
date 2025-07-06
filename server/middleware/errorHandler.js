/**
 * Comprehensive Error Handler for SealKloud API
 * Provides structured error responses with consistent error codes
 */

// Error code definitions
export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  AUTH_INVALID_CREDENTIALS: 'AUTH_1001',
  AUTH_TOKEN_EXPIRED: 'AUTH_1002',
  AUTH_TOKEN_INVALID: 'AUTH_1003',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_1004',
  AUTH_USER_NOT_FOUND: 'AUTH_1005',
  AUTH_ACCOUNT_LOCKED: 'AUTH_1006',
  
  // Validation Errors (2000-2099)
  VALIDATION_REQUIRED_FIELD: 'VAL_2001',
  VALIDATION_INVALID_FORMAT: 'VAL_2002',
  VALIDATION_INVALID_EMAIL: 'VAL_2003',
  VALIDATION_PASSWORD_TOO_WEAK: 'VAL_2004',
  VALIDATION_INVALID_ROLE: 'VAL_2005',
  
  // Resource Errors (3000-3099)
  RESOURCE_NOT_FOUND: 'RES_3001',
  RESOURCE_ALREADY_EXISTS: 'RES_3002',
  RESOURCE_CONFLICT: 'RES_3003',
  RESOURCE_DELETED: 'RES_3004',
  
  // Database Errors (4000-4099)
  DB_CONNECTION_ERROR: 'DB_4001',
  DB_QUERY_ERROR: 'DB_4002',
  DB_FOREIGN_KEY_VIOLATION: 'DB_4003',
  DB_UNIQUE_VIOLATION: 'DB_4004',
  DB_NOT_NULL_VIOLATION: 'DB_4005',
  
  // Rate Limiting Errors (5000-5099)
  RATE_LIMIT_EXCEEDED: 'RATE_5001',
  
  // Business Logic Errors (6000-6099)
  TICKET_ALREADY_ASSIGNED: 'BIZ_6001',
  TICKET_INVALID_STATUS_TRANSITION: 'BIZ_6002',
  USER_ALREADY_ACTIVE: 'BIZ_6003',
  INVALID_TICKET_PRIORITY: 'BIZ_6004',
  
  // System Errors (9000-9099)
  INTERNAL_SERVER_ERROR: 'SYS_9001',
  SERVICE_UNAVAILABLE: 'SYS_9002',
  MAINTENANCE_MODE: 'SYS_9003'
};

// Error message mappings
const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: 'Account is locked due to multiple failed attempts',
  
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Invalid data format',
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Invalid email format',
  [ERROR_CODES.VALIDATION_PASSWORD_TOO_WEAK]: 'Password does not meet security requirements',
  [ERROR_CODES.VALIDATION_INVALID_ROLE]: 'Invalid user role specified',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Requested resource not found',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Resource conflict detected',
  [ERROR_CODES.RESOURCE_DELETED]: 'Resource has been deleted',
  
  [ERROR_CODES.DB_CONNECTION_ERROR]: 'Database connection error',
  [ERROR_CODES.DB_QUERY_ERROR]: 'Database query error',
  [ERROR_CODES.DB_FOREIGN_KEY_VIOLATION]: 'Referenced resource not found',
  [ERROR_CODES.DB_UNIQUE_VIOLATION]: 'Resource already exists',
  [ERROR_CODES.DB_NOT_NULL_VIOLATION]: 'Required field missing',
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later',
  
  [ERROR_CODES.TICKET_ALREADY_ASSIGNED]: 'Ticket is already assigned to another user',
  [ERROR_CODES.TICKET_INVALID_STATUS_TRANSITION]: 'Invalid status transition for this ticket',
  [ERROR_CODES.USER_ALREADY_ACTIVE]: 'User is already active',
  [ERROR_CODES.INVALID_TICKET_PRIORITY]: 'Invalid ticket priority level',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ERROR_CODES.MAINTENANCE_MODE]: 'Service is currently under maintenance'
};

// HTTP status code mappings
const STATUS_CODES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 401,
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 401,
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 403,
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 404,
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: 423,
  
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 400,
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 400,
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 400,
  [ERROR_CODES.VALIDATION_PASSWORD_TOO_WEAK]: 400,
  [ERROR_CODES.VALIDATION_INVALID_ROLE]: 400,
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 409,
  [ERROR_CODES.RESOURCE_CONFLICT]: 409,
  [ERROR_CODES.RESOURCE_DELETED]: 410,
  
  [ERROR_CODES.DB_CONNECTION_ERROR]: 503,
  [ERROR_CODES.DB_QUERY_ERROR]: 500,
  [ERROR_CODES.DB_FOREIGN_KEY_VIOLATION]: 400,
  [ERROR_CODES.DB_UNIQUE_VIOLATION]: 409,
  [ERROR_CODES.DB_NOT_NULL_VIOLATION]: 400,
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  
  [ERROR_CODES.TICKET_ALREADY_ASSIGNED]: 409,
  [ERROR_CODES.TICKET_INVALID_STATUS_TRANSITION]: 400,
  [ERROR_CODES.USER_ALREADY_ACTIVE]: 409,
  [ERROR_CODES.INVALID_TICKET_PRIORITY]: 400,
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.MAINTENANCE_MODE]: 503
};

/**
 * Create a structured error response
 * @param {string} errorCode - The error code from ERROR_CODES
 * @param {string} message - Custom error message (optional)
 * @param {Object} details - Additional error details (optional)
 * @returns {Object} Structured error object
 */
export const createError = (errorCode, message = null, details = null) => {
  return {
    error: {
      code: errorCode,
      message: message || ERROR_MESSAGES[errorCode] || 'Unknown error',
      status: STATUS_CODES[errorCode] || 500,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    }
  };
};

/**
 * Enhanced error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  let errorResponse;

  // Handle specific error types
  if (err.code) {
    // PostgreSQL errors
    switch (err.code) {
      case '23505': // Unique violation
        errorResponse = createError(ERROR_CODES.DB_UNIQUE_VIOLATION, 'Resource already exists');
        break;
      case '23503': // Foreign key violation
        errorResponse = createError(ERROR_CODES.DB_FOREIGN_KEY_VIOLATION, 'Referenced resource not found');
        break;
      case '23502': // Not null violation
        errorResponse = createError(ERROR_CODES.DB_NOT_NULL_VIOLATION, 'Required field missing');
        break;
      case 'ECONNREFUSED': // Database connection refused
        errorResponse = createError(ERROR_CODES.DB_CONNECTION_ERROR, 'Database connection failed');
        break;
      default:
        errorResponse = createError(ERROR_CODES.DB_QUERY_ERROR, err.message);
    }
  } else if (err.name) {
    // JWT errors
    switch (err.name) {
      case 'JsonWebTokenError':
        errorResponse = createError(ERROR_CODES.AUTH_TOKEN_INVALID);
        break;
      case 'TokenExpiredError':
        errorResponse = createError(ERROR_CODES.AUTH_TOKEN_EXPIRED);
        break;
      case 'ValidationError':
        errorResponse = createError(ERROR_CODES.VALIDATION_REQUIRED_FIELD, err.message);
        break;
      default:
        errorResponse = createError(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message);
    }
  } else if (err.status) {
    // Custom application errors
    const status = err.status;
    const message = err.message || 'An error occurred';
    
    if (status === 404) {
      errorResponse = createError(ERROR_CODES.RESOURCE_NOT_FOUND, message);
    } else if (status === 401) {
      errorResponse = createError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, message);
    } else if (status === 403) {
      errorResponse = createError(ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS, message);
    } else if (status === 409) {
      errorResponse = createError(ERROR_CODES.RESOURCE_CONFLICT, message);
    } else if (status === 429) {
      errorResponse = createError(ERROR_CODES.RATE_LIMIT_EXCEEDED, message);
    } else {
      errorResponse = createError(ERROR_CODES.INTERNAL_SERVER_ERROR, message);
    }
  } else {
    // Generic error
    errorResponse = createError(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message);
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Add request ID if available
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  res.status(errorResponse.error.status).json(errorResponse);
};