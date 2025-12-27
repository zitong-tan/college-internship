# Notification API Implementation

## Overview

The Notification API provides endpoints for managing user notifications, including querying notifications, marking them as read, and triggering automated reminders for expiring internships.

## API Endpoints

### 1. Get Notification List

**Endpoint:** `GET /api/notifications`

**Authentication:** Required

**Query Parameters:**
- `is_read` (optional): Filter by read status (`true` or `false`)
- `type` (optional): Filter by notification type
- `limit` (optional): Number of notifications to return (default: 50)
- `offset` (optional): Number of notifications to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "user_id": 1,
        "title": "实习申请已通过",
        "content": "您的实习申请已通过审批，岗位：前端开发实习",
        "type": "application_approved",
        "is_read": false,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 50,
      "offset": 0
    },
    "unread_count": 3
  },
  "message": "获取通知列表成功"
}
```

**Validates Requirements:** 9.4

---

### 2. Get Unread Notification Count

**Endpoint:** `GET /api/notifications/unread-count`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  },
  "message": "获取未读通知数量成功"
}
```

**Validates Requirements:** 9.4

---

### 3. Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

**Authentication:** Required

**URL Parameters:**
- `id`: Notification ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "实习申请已通过",
    "content": "您的实习申请已通过审批，岗位：前端开发实习",
    "type": "application_approved",
    "is_read": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "通知已标记为已读"
}
```

**Error Responses:**
- `403 Forbidden`: User doesn't own the notification
- `404 Not Found`: Notification doesn't exist

**Validates Requirements:** 9.5

---

### 4. Mark All Notifications as Read

**Endpoint:** `PUT /api/notifications/read-all`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_count": 5
  },
  "message": "已标记 5 条通知为已读"
}
```

**Validates Requirements:** 9.5

---

### 5. Delete Notification

**Endpoint:** `DELETE /api/notifications/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Notification ID

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "通知已删除"
}
```

**Error Responses:**
- `403 Forbidden`: User doesn't own the notification
- `404 Not Found`: Notification doesn't exist

---

### 6. Send Expiring Internship Reminders

**Endpoint:** `POST /api/notifications/send-reminders`

**Authentication:** Required (Teacher role only)

**Description:** Manually triggers the system to check for internships expiring within 7 days and send reminder notifications to students and teachers.

**Response:**
```json
{
  "success": true,
  "data": {
    "internships_checked": 5,
    "notifications_sent": 10
  },
  "message": "已检查 5 个实习记录，发送 10 条提醒通知"
}
```

**Error Responses:**
- `403 Forbidden`: User is not a teacher

**Validates Requirements:** 9.3

---

### 7. Update Expired Internships

**Endpoint:** `POST /api/notifications/update-expired`

**Authentication:** Required (Teacher role only)

**Description:** Manually triggers the system to check for expired internships, update their status to 'pending_evaluation', and send notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "internships": [1, 2, 3]
  },
  "message": "已更新 3 个过期实习记录的状态并发送通知"
}
```

**Error Responses:**
- `403 Forbidden`: User is not a teacher

**Validates Requirements:** 9.1

---

## Notification Types

The system uses the following notification types:

- `application_submitted`: New application submitted (sent to teachers)
- `application_approved`: Application approved (sent to student and enterprise)
- `application_rejected`: Application rejected (sent to student)
- `evaluation_submitted`: Evaluation submitted (sent to student)
- `internship_completed`: Both evaluations complete (sent to student)
- `internship_expiring`: Internship expiring soon (sent to student and teacher)
- `internship_expired`: Internship expired (sent to student and teacher)

---

## Notification Service Functions

The notification service provides the following functions for creating notifications:

### createNotification(userId, title, content, type)

Creates a single notification for a user.

**Parameters:**
- `userId` (number): User ID to send notification to
- `title` (string): Notification title
- `content` (string): Notification content
- `type` (string, optional): Notification type

**Returns:** Promise<Notification>

---

### createBulkNotifications(notifications)

Creates multiple notifications at once.

**Parameters:**
- `notifications` (Array): Array of notification objects with `userId`, `title`, `content`, and `type`

**Returns:** Promise<Array<Notification>>

---

### notifyApplicationStatusChange(application, newStatus, rejectionReason)

Sends notifications when application status changes.

**Parameters:**
- `application` (Object): Application object with related data
- `newStatus` (string): New status ('approved' or 'rejected')
- `rejectionReason` (string, optional): Rejection reason if rejected

---

### notifyNewApplication(application, teachers)

Sends notifications to teachers when a new application is submitted.

**Parameters:**
- `application` (Object): Application object with related data
- `teachers` (Array): Array of teacher objects

---

### notifyEvaluationSubmitted(internship, evaluatorType)

Sends notification when an evaluation is submitted.

**Parameters:**
- `internship` (Object): Internship object with related data
- `evaluatorType` (string): 'teacher' or 'enterprise'

---

### sendExpiringInternshipReminders()

Checks for internships expiring within 7 days and sends reminders.

**Returns:** Promise<Object> with `internships_checked` and `notifications_sent`

---

### updateExpiredInternships()

Updates expired internships status and sends notifications.

**Returns:** Promise<Object> with `updated` count and `internships` array

---

## Integration with Other Systems

### Application System

Notifications are automatically created when:
- A student submits an application (notifies teachers)
- A teacher approves an application (notifies student and enterprise)
- A teacher rejects an application (notifies student)

### Internship System

Notifications are automatically created when:
- An evaluation is submitted (notifies student)
- Both evaluations are complete (notifies student)
- An internship expires (can be triggered manually or via scheduled job)

### Scheduled Tasks

For production deployment, consider setting up scheduled tasks (cron jobs) to:
- Run `sendExpiringInternshipReminders()` daily to check for expiring internships
- Run `updateExpiredInternships()` daily to update expired internship statuses

Example cron schedule:
```bash
# Check for expiring internships daily at 9:00 AM
0 9 * * * curl -X POST http://localhost:3000/api/notifications/send-reminders -H "Authorization: Bearer <teacher-token>"

# Update expired internships daily at 1:00 AM
0 1 * * * curl -X POST http://localhost:3000/api/notifications/update-expired -H "Authorization: Bearer <teacher-token>"
```

---

## Testing

Unit tests are available in `src/controllers/__tests__/notificationController.test.js`.

Run tests with:
```bash
npm test -- notificationController.test.js
```

Manual testing script is available in `test-notifications.js` (requires server to be running):
```bash
# Start the server
npm start

# In another terminal, run the test script
node test-notifications.js
```

---

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 9.1**: Status change notifications (via `notifyApplicationStatusChange` and `updateExpiredInternships`)
- **Requirement 9.2**: New application notifications (via `notifyNewApplication`)
- **Requirement 9.3**: Expiring internship reminders (via `sendExpiringInternshipReminders`)
- **Requirement 9.4**: Unread notification count display (via `getUnreadCount` and included in `getNotifications`)
- **Requirement 9.5**: Mark notifications as read (via `markAsRead` and `markAllAsRead`)
