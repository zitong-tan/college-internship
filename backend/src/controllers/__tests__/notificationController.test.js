/**
 * Notification Controller Tests
 * Tests notification query and management functionality
 */

const notificationService = require('../../services/notificationService');
const { Notification } = require('../../models');

describe('Notification System', () => {
  describe('Notification Service', () => {
    it('should have createNotification function', () => {
      expect(typeof notificationService.createNotification).toBe('function');
    });

    it('should have createBulkNotifications function', () => {
      expect(typeof notificationService.createBulkNotifications).toBe('function');
    });

    it('should have notifyApplicationStatusChange function', () => {
      expect(typeof notificationService.notifyApplicationStatusChange).toBe('function');
    });

    it('should have notifyNewApplication function', () => {
      expect(typeof notificationService.notifyNewApplication).toBe('function');
    });

    it('should have notifyEvaluationSubmitted function', () => {
      expect(typeof notificationService.notifyEvaluationSubmitted).toBe('function');
    });

    it('should have sendExpiringInternshipReminders function', () => {
      expect(typeof notificationService.sendExpiringInternshipReminders).toBe('function');
    });

    it('should have updateExpiredInternships function', () => {
      expect(typeof notificationService.updateExpiredInternships).toBe('function');
    });
  });

  describe('Notification Model', () => {
    it('should have required fields defined', () => {
      const attributes = Notification.rawAttributes;
      
      expect(attributes.user_id).toBeDefined();
      expect(attributes.title).toBeDefined();
      expect(attributes.content).toBeDefined();
      expect(attributes.type).toBeDefined();
      expect(attributes.is_read).toBeDefined();
      expect(attributes.created_at).toBeDefined();
    });

    it('should have correct field types', () => {
      const attributes = Notification.rawAttributes;
      
      expect(attributes.user_id.type.constructor.name).toBe('INTEGER');
      expect(attributes.title.type.constructor.name).toBe('STRING');
      expect(attributes.content.type.constructor.name).toBe('TEXT');
      expect(attributes.is_read.type.constructor.name).toBe('BOOLEAN');
    });

    it('should have is_read default to false', () => {
      const attributes = Notification.rawAttributes;
      expect(attributes.is_read.defaultValue).toBe(false);
    });

    it('should have user_id as required field', () => {
      const attributes = Notification.rawAttributes;
      expect(attributes.user_id.allowNull).toBe(false);
    });

    it('should have title as required field', () => {
      const attributes = Notification.rawAttributes;
      expect(attributes.title.allowNull).toBe(false);
    });

    it('should have content as required field', () => {
      const attributes = Notification.rawAttributes;
      expect(attributes.content.allowNull).toBe(false);
    });
  });

  describe('Notification Controller Functions', () => {
    const notificationController = require('../../controllers/notificationController');

    it('should have getNotifications function', () => {
      expect(typeof notificationController.getNotifications).toBe('function');
    });

    it('should have getUnreadCount function', () => {
      expect(typeof notificationController.getUnreadCount).toBe('function');
    });

    it('should have markAsRead function', () => {
      expect(typeof notificationController.markAsRead).toBe('function');
    });

    it('should have markAllAsRead function', () => {
      expect(typeof notificationController.markAllAsRead).toBe('function');
    });

    it('should have deleteNotification function', () => {
      expect(typeof notificationController.deleteNotification).toBe('function');
    });

    it('should have sendReminders function', () => {
      expect(typeof notificationController.sendReminders).toBe('function');
    });

    it('should have updateExpired function', () => {
      expect(typeof notificationController.updateExpired).toBe('function');
    });
  });

  describe('Notification Routes', () => {
    it('should export notification routes', () => {
      const notificationRoutes = require('../../routes/notifications');
      expect(notificationRoutes).toBeDefined();
      expect(typeof notificationRoutes).toBe('function'); // Express router is a function
    });
  });
});
