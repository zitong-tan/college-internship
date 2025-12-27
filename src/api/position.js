import request from '@/utils/request';

/**
 * Position API
 */

// Get positions list with filters and pagination
export function getPositions(params) {
  return request({
    url: '/positions',
    method: 'get',
    params
  });
}

// Get position detail by ID
export function getPosition(id) {
  return request({
    url: `/positions/${id}`,
    method: 'get'
  });
}

// Create new position (enterprise only)
export function createPosition(data) {
  return request({
    url: '/positions',
    method: 'post',
    data
  });
}

// Update position (enterprise only)
export function updatePosition(id, data) {
  return request({
    url: `/positions/${id}`,
    method: 'put',
    data
  });
}

// Delete position (enterprise only)
export function deletePosition(id) {
  return request({
    url: `/positions/${id}`,
    method: 'delete'
  });
}

export default {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition
};
