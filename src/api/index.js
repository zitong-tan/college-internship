/**
 * API Module Index
 * Centralized export of all API modules
 */

import auth from './auth';
import position from './position';
import application from './application';
import internship from './internship';
import notification from './notification';
import statistics from './statistics';

export default {
  auth,
  position,
  application,
  internship,
  notification,
  statistics
};

// Also export individual modules for direct import
export {
  auth,
  position,
  application,
  internship,
  notification,
  statistics
};
