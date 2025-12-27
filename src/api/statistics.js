import request from '@/utils/request';

/**
 * Statistics API
 */

// Get statistics overview
export function getStatistics(params) {
  return request({
    url: '/statistics/overview',
    method: 'get',
    params
  });
}

// Export statistics report
export function exportReport(params) {
  return request({
    url: '/statistics/export',
    method: 'get',
    params,
    responseType: 'blob' // For file download
  });
}

export default {
  getStatistics,
  exportReport
};
