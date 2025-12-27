/**
 * Notification Controller
 * Handles notification queries and management
 */

const { Notification } = require('../models');
const { successResponse, errorResponse, notFoundErrorResponse } = require('../utils/response');
const { sendExpiringInternshipReminders, updateExpiredInternships } = require('../services/notificationService');

/**
 * Get notification list for current user
 * GET /api/notifications
 * Validates Requirements 9.4
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_read, type, limit, offset } = req.query;

    // Build where clause
    const whereClause = { user_id: userId };
    
    if (is_read !== undefined) {
      whereClause.is_read = is_read === 'true' || is_read === '1';
    }
    
    if (type) {
      whereClause.type = type;
    }

    // Parse pagination parameters
    const limitValue = limit ? parseInt(limit) : 50;
    const offsetValue = offset ? parseInt(offset) : 0;

    // Get notifications
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limitValue,
      offset: offsetValue
    });

    // Get total count
    const totalCount = await Notification.count({
      where: whereClause
    });

    // Get unread count (Requirement 9.4)
    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return res.status(200).json(successResponse({
      notifications,
      pagination: {
        total: totalCount,
        limit: limitValue,
        offset: offsetValue
      },
      unread_count: unreadCount
    }, '获取通知列表成功'));

  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 * Validates Requirements 9.4
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return res.status(200).json(successResponse({
      unread_count: unreadCount
    }, '获取未读通知数量成功'));

  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 * Validates Requirements 9.5
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find notification
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json(notFoundErrorResponse('通知'));
    }

    // Check if notification belongs to current user
    if (notification.user_id !== userId) {
      return res.status(403).json(errorResponse('FORBIDDEN', '您没有权限操作此通知'));
    }

    // Mark as read (Requirement 9.5)
    if (!notification.is_read) {
      notification.is_read = true;
      await notification.save();
    }

    return res.status(200).json(successResponse(notification, '通知已标记为已读'));

  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 * Validates Requirements 9.5
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for the user
    const [updatedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );

    return res.status(200).json(successResponse({
      updated_count: updatedCount
    }, `已标记 ${updatedCount} 条通知为已读`));

  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find notification
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json(notFoundErrorResponse('通知'));
    }

    // Check if notification belongs to current user
    if (notification.user_id !== userId) {
      return res.status(403).json(errorResponse('FORBIDDEN', '您没有权限删除此通知'));
    }

    // Delete notification
    await notification.destroy();

    return res.status(200).json(successResponse(null, '通知已删除'));

  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Send expiring internship reminders (manual trigger)
 * POST /api/notifications/send-reminders
 * Validates Requirements 9.3
 */
const sendReminders = async (req, res) => {
  try {
    // Only teachers or admins should be able to trigger this
    if (req.user.role !== 'teacher') {
      return res.status(403).json(errorResponse('FORBIDDEN', '您没有权限执行此操作'));
    }

    const result = await sendExpiringInternshipReminders();

    return res.status(200).json(successResponse(result, 
      `已检查 ${result.internships_checked} 个实习记录，发送 ${result.notifications_sent} 条提醒通知`));

  } catch (error) {
    console.error('Send reminders error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

/**
 * Update expired internships and send notifications (manual trigger)
 * POST /api/notifications/update-expired
 * Validates Requirements 9.1
 */
const updateExpired = async (req, res) => {
  try {
    // Only teachers or admins should be able to trigger this
    if (req.user.role !== 'teacher') {
      return res.status(403).json(errorResponse('FORBIDDEN', '您没有权限执行此操作'));
    }

    const result = await updateExpiredInternships();

    return res.status(200).json(successResponse(result, 
      `已更新 ${result.updated} 个过期实习记录的状态并发送通知`));

  } catch (error) {
    console.error('Update expired error:', error);
    return res.status(500).json(errorResponse('INTERNAL_ERROR', '服务器内部错误，请稍后重试'));
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendReminders,
  updateExpired
};
