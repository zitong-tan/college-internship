/**
 * Logger utility for operation logging
 * Validates Requirement 10.4 (critical operation logging)
 */

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Format log message
 */
const formatLog = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
};

/**
 * Write log to file
 */
const writeToFile = (level, logData) => {
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${level.toLowerCase()}-${date}.log`);
  const logLine = JSON.stringify(logData) + '\n';
  
  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
};

/**
 * Log error
 */
const error = (message, meta = {}) => {
  const logData = formatLog(LOG_LEVELS.ERROR, message, meta);
  console.error(JSON.stringify(logData));
  writeToFile(LOG_LEVELS.ERROR, logData);
};

/**
 * Log warning
 */
const warn = (message, meta = {}) => {
  const logData = formatLog(LOG_LEVELS.WARN, message, meta);
  console.warn(JSON.stringify(logData));
  writeToFile(LOG_LEVELS.WARN, logData);
};

/**
 * Log info
 */
const info = (message, meta = {}) => {
  const logData = formatLog(LOG_LEVELS.INFO, message, meta);
  console.log(JSON.stringify(logData));
  if (process.env.NODE_ENV === 'production') {
    writeToFile(LOG_LEVELS.INFO, logData);
  }
};

/**
 * Log debug (only in development)
 */
const debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    const logData = formatLog(LOG_LEVELS.DEBUG, message, meta);
    console.log(JSON.stringify(logData));
  }
};

/**
 * Log critical operation
 * Used for tracking important system operations
 */
const logOperation = (operation, userId, details = {}) => {
  const logData = formatLog(LOG_LEVELS.INFO, `Operation: ${operation}`, {
    userId,
    operation,
    ...details
  });
  console.log(JSON.stringify(logData));
  writeToFile('OPERATION', logData);
};

/**
 * Log HTTP request
 */
const logRequest = (req, res, duration) => {
  const logData = formatLog(LOG_LEVELS.INFO, 'HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.id,
    ip: req.ip
  });
  
  if (res.statusCode >= 400) {
    console.error(JSON.stringify(logData));
    writeToFile('REQUEST', logData);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify(logData));
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  logOperation,
  logRequest
};
