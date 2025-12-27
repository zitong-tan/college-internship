/**
 * Notification Routes
 * Defines API endpoints for notification management
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get notification list for current user
 * Query params: is_read, type, limit, offset
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * POST /api/notifications/send-reminders
 * Manually trigger expiring internship reminders
 * Requires teacher role
 */
router.post('/send-reminders', notificationController.sendReminders);

/**
 * POST /api/notifications/update-expired
 * Manually trigger expired internship status update
 * Requires teacher role
 */
router.post('/update-expired', notificationController.updateExpired);

module.exports = router;
