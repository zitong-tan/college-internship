import request from '@/utils/request';

/**
 * Authentication API
 */

// User login
export function login(credentials) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: credentials
  });
}

// User logout
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

// Get current user profile
export function getProfile() {
  return request({
    url: '/auth/profile',
    method: 'get'
  });
}

// Update password
export function updatePassword(passwordData) {
  return request({
    url: '/auth/password',
    method: 'put',
    data: passwordData
  });
}

export default {
  login,
  logout,
  getProfile,
  updatePassword
};
