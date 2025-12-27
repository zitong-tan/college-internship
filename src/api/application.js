import request from '@/utils/request';

/**
 * Application API
 */

// Get applications list with filters and pagination
export function getApplications(params) {
  return request({
    url: '/applications',
    method: 'get',
    params
  });
}

// Get application detail by ID
export function getApplication(id) {
  return request({
    url: `/applications/${id}`,
    method: 'get'
  });
}

// Submit application (student only)
export function submitApplication(data) {
  return request({
    url: '/applications',
    method: 'post',
    data
  });
}

// Approve application (teacher only)
export function approveApplication(id) {
  return request({
    url: `/applications/${id}/approve`,
    method: 'put'
  });
}

// Reject application (teacher only)
export function rejectApplication(id, reason) {
  return request({
    url: `/applications/${id}/reject`,
    method: 'put',
    data: { rejection_reason: reason }
  });
}

export default {
  getApplications,
  getApplication,
  submitApplication,
  approveApplication,
  rejectApplication
};
