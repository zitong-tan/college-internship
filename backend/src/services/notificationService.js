/**
 * Notification Service
 * Handles notification creation and management
 */

const { Notification, Internship, Student, Teacher, User, Position } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a notification for a user
 * @param {number} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} content - Notification content
 * @param {string} type - Notification type
 * @returns {Promise<Notification>} Created notification
 */
async function createNotification(userId, title, content, type = null) {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      content,
      type,
      is_read: false,
      created_at: new Date()
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Promise<Array<Notification>>} Created notifications
 */
async function createBulkNotifications(notifications) {
  try {
    const notificationRecords = notifications.map(notif => ({
      user_id: notif.userId,
      title: notif.title,
      content: notif.content,
      type: notif.type || null,
      is_read: false,
      created_at: new Date()
    }));
    
    const created = await Notification.bulkCreate(notificationRecords);
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Send notification when application status changes
 * @param {Object} application - Application object
 * @param {string} newStatus - New status ('approved' or 'rejected')
 * @param {string} rejectionReason - Rejection reason (if rejected)
 */
async function notifyApplicationStatusChange(application, newStatus, rejectionReason = null) {
  try {
    const notifications = [];
    
    if (newStatus === 'approved') {
      // Notify student
      notifications.push({
        userId: application.student.user.id,
        title: '实习申请已通过',
        content: `您的实习申请已通过审批，岗位：${application.position.title}`,
        type: 'application_approved'
      });
      
      // Notify enterprise
      notifications.push({
        userId: application.position.enterprise.user.id,
        title: '新的实习生',
        content: `学生的实习申请已通过，岗位：${application.position.title}`,
        type: 'application_approved'
      });
    } else if (newStatus === 'rejected') {
      // Notify student
      notifications.push({
        userId: application.student.user.id,
        title: '实习申请已被拒绝',
        content: `您的实习申请已被拒绝，岗位：${application.position.title}。原因：${rejectionReason}`,
        type: 'application_rejected'
      });
    }
    
    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  } catch (error) {
    console.error('Error notifying application status change:', error);
    throw error;
  }
}

/**
 * Send notification when new application is submitted
 * @param {Object} application - Application object
 * @param {Array<Object>} teachers - Array of teacher objects
 */
async function notifyNewApplication(application, teachers) {
  try {
    const notifications = teachers.map(teacher => ({
      userId: teacher.user.id,
      title: '新的实习申请待审批',
      content: `学生已提交实习申请，岗位：${application.position.title}`,
      type: 'application_submitted'
    }));
    
    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  } catch (error) {
    console.error('Error notifying new application:', error);
    throw error;
  }
}

/**
 * Send notification when evaluation is submitted
 * @param {Object} internship - Internship object
 * @param {string} evaluatorType - 'teacher' or 'enterprise'
 */
async function notifyEvaluationSubmitted(internship, evaluatorType) {
  try {
    // Notify student
    const title = evaluatorType === 'teacher' ? '教师评价已提交' : '企业评价已提交';
    const content = `您的实习评价已提交，评分：${evaluatorType === 'teacher' ? internship.teacher_score : internship.enterprise_score}`;
    
    await createNotification(
      internship.student.user.id,
      title,
      content,
      'evaluation_submitted'
    );
    
    // If both evaluations are complete, notify about completion
    if (internship.teacher_score !== null && internship.enterprise_score !== null) {
      await createNotification(
        internship.student.user.id,
        '实习评价已完成',
        `您的实习评价已全部完成，综合评分：${internship.final_score}`,
        'internship_completed'
      );
    }
  } catch (error) {
    console.error('Error notifying evaluation submitted:', error);
    throw error;
  }
}

/**
 * Check for internships expiring soon and send reminders
 * Sends reminders for internships ending within 7 days
 * @returns {Promise<Object>} Result with count of notifications sent
 */
async function sendExpiringInternshipReminders() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Find ongoing internships ending within 7 days
    const expiringInternships = await Internship.findAll({
      where: {
        status: 'ongoing',
        end_date: {
          [Op.gte]: now,
          [Op.lte]: sevenDaysFromNow
        }
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Position,
          as: 'position'
        }
      ]
    });
    
    const notifications = [];
    
    for (const internship of expiringInternships) {
      const daysRemaining = Math.ceil((new Date(internship.end_date) - now) / (1000 * 60 * 60 * 24));
      
      // Notify student
      notifications.push({
        userId: internship.student.user.id,
        title: '实习即将到期',
        content: `您的实习将在 ${daysRemaining} 天后到期，岗位：${internship.position.title}。请及时完成实习任务。`,
        type: 'internship_expiring'
      });
      
      // Notify teacher if assigned
      if (internship.teacher) {
        notifications.push({
          userId: internship.teacher.user.id,
          title: '学生实习即将到期',
          content: `学生的实习将在 ${daysRemaining} 天后到期，岗位：${internship.position.title}。`,
          type: 'internship_expiring'
        });
      }
    }
    
    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
    
    return {
      internships_checked: expiringInternships.length,
      notifications_sent: notifications.length
    };
  } catch (error) {
    console.error('Error sending expiring internship reminders:', error);
    throw error;
  }
}

/**
 * Check for expired internships and update their status
 * Also sends notifications about status change
 * @returns {Promise<Object>} Result with count of updated internships
 */
async function updateExpiredInternships() {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Find all ongoing internships that have passed their end date
    const expiredInternships = await Internship.findAll({
      where: {
        status: 'ongoing',
        end_date: {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Position,
          as: 'position'
        }
      ]
    });
    
    const notifications = [];
    
    // Update each expired internship and create notifications
    for (const internship of expiredInternships) {
      await internship.update({ status: 'pending_evaluation' });
      
      // Notify student
      notifications.push({
        userId: internship.student.user.id,
        title: '实习已到期，请等待评价',
        content: `您的实习已到期，岗位：${internship.position.title}。请等待教师和企业的评价。`,
        type: 'internship_expired'
      });
      
      // Notify teacher
      if (internship.teacher) {
        notifications.push({
          userId: internship.teacher.user.id,
          title: '学生实习已到期，请评价',
          content: `学生的实习已到期，岗位：${internship.position.title}。请及时提交评价。`,
          type: 'internship_expired'
        });
      }
    }
    
    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
    
    return {
      updated: expiredInternships.length,
      internships: expiredInternships.map(i => i.id)
    };
  } catch (error) {
    console.error('Error updating expired internships:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyApplicationStatusChange,
  notifyNewApplication,
  notifyEvaluationSubmitted,
  sendExpiringInternshipReminders,
  updateExpiredInternships
};
