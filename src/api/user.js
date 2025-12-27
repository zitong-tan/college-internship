import request from '@/utils/request';

/**
 * User API
 */

// Get current user profile
export function getProfile() {
  return request({
    url: '/auth/profile',
    method: 'get'
  });
}

// Update user password
export function updatePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  });
}

// Update user profile
export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  });
}

export default {
  getProfile,
  updatePassword,
  updateProfile
};
