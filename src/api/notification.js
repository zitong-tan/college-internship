import request from '@/utils/request';

/**
 * Notification API
 */

// Get notifications list with pagination
export function getNotifications(params) {
  return request({
    url: '/notifications',
    method: 'get',
    params
  });
}

// Get unread notifications count
export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count',
    method: 'get'
  });
}

// Mark notification as read
export function markAsRead(id) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'put'
  });
}

// Mark all notifications as read
export function markAllAsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'put'
  });
}

// Delete notification
export function deleteNotification(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  });
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
