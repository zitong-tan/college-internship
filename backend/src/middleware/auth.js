const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return errorResponse(res, 'Token has expired, please login again', 401, 'TOKEN_EXPIRED');
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired, please login again', 401, 'TOKEN_EXPIRED');
      } else if (error.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401, 'INVALID_TOKEN');
      } else {
        throw error;
      }
    }
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401, 'UNAUTHORIZED');
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401, 'UNAUTHORIZED');
    }

    // Flatten array in case roles are passed as array
    const roles = allowedRoles.flat();

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        req.user = {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        };
      } catch (error) {
        // Token is invalid, but we don't fail the request
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
