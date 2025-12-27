# Application API Implementation

## Overview

This document describes the implementation of the internship application functionality for the University Internship Management System. The implementation covers application submission, business rule validation, approval/rejection workflows, and automatic internship record creation.

## Implemented Features

### 1. Application Submission (Task 6.1)

**Endpoint:** `POST /api/applications`

**Authentication:** Required (Student role only)

**Requirements Validated:**
- Requirement 4.1: Create application record and associate student with position
- Requirement 4.4: Validate application data integrity

**Request Body:**
```json
{
  "position_id": 1,
  "personal_statement": "我对这个岗位非常感兴趣...",
  "contact_info": "13800138000"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 1,
    "position_id": 1,
    "status": "pending",
    "personal_statement": "我对这个岗位非常感兴趣...",
    "contact_info": "13800138000",
    "applied_at": "2024-01-01T00:00:00.000Z",
    "student": { ... },
    "position": { ... }
  },
  "message": "申请提交成功",
  "timestamp": 1640000000000
}
```

**Validation Rules:**
- `position_id`: Required, must exist
- `personal_statement`: Required, cannot be empty or whitespace only
- `contact_info`: Required, cannot be empty or whitespace only

### 2. Business Rule Validation (Task 6.3)

**Requirements Validated:**
- Requirement 4.2: Prevent duplicate applications
- Requirement 4.3: Check position availability

**Duplicate Application Prevention:**
- Students cannot submit a new application if they have an existing application with status `pending` or `approved`
- Returns 409 Conflict with error code `DUPLICATE_APPLICATION`

**Position Availability Check:**
- Applications are rejected if the position has `available_slots <= 0`
- Returns 409 Conflict with error code `POSITION_FULL`

### 3. Application Notification (Task 6.5)

**Requirements Validated:**
- Requirement 4.5: Notify teachers after application submission
- Requirement 9.2: Send notifications for new applications

**Notification Behavior:**
- When an application is submitted, all teachers receive a notification
- Notification type: `application_submitted`
- Notification includes position title and student information

### 4. Application Approval (Task 6.7)

**Endpoint:** `PUT /api/applications/:id/approve`

**Authentication:** Required (Teacher role only)

**Requirements Validated:**
- Requirement 5.2: Update status and notify student and enterprise
- Requirement 5.5: Record approval information

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "reviewed_at": "2024-01-01T00:00:00.000Z",
    "reviewed_by": 1,
    "teacher_id": 1,
    "internship": { ... }
  },
  "message": "申请已批准，实习记录已创建",
  "timestamp": 1640000000000
}
```

**Approval Process:**
1. Verify application exists and is in `pending` status
2. Update application status to `approved`
3. Record review timestamp and reviewer information
4. Create internship record (see Task 6.9)
5. Decrease position available slots
6. Send notifications to student and enterprise

**Notifications Sent:**
- To student: "实习申请已通过" (application_approved)
- To enterprise: "新的实习生" (application_approved)

### 5. Application Rejection (Task 6.7)

**Endpoint:** `PUT /api/applications/:id/reject`

**Authentication:** Required (Teacher role only)

**Requirements Validated:**
- Requirement 5.3: Require rejection reason
- Requirement 5.5: Record approval information

**Request Body:**
```json
{
  "rejection_reason": "申请材料不完整，请补充相关证明文件。"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "rejection_reason": "申请材料不完整，请补充相关证明文件。",
    "reviewed_at": "2024-01-01T00:00:00.000Z",
    "reviewed_by": 1
  },
  "message": "申请已拒绝",
  "timestamp": 1640000000000
}
```

**Rejection Process:**
1. Verify rejection reason is provided and not empty
2. Verify application exists and is in `pending` status
3. Update application status to `rejected`
4. Record rejection reason, review timestamp, and reviewer
5. Send notification to student

**Notification Sent:**
- To student: "实习申请已被拒绝" with reason (application_rejected)

### 6. Internship Record Creation (Task 6.9)

**Requirements Validated:**
- Requirement 5.4: Create internship record and decrease available slots

**Automatic Creation:**
- When an application is approved, an internship record is automatically created
- The internship inherits dates from the position
- Initial status is set to `ongoing`

**Internship Record Fields:**
```javascript
{
  application_id: application.id,
  student_id: application.student_id,
  position_id: application.position_id,
  enterprise_id: position.enterprise_id,
  teacher_id: teacher.id,
  start_date: position.start_date,
  end_date: position.end_date,
  status: 'ongoing'
}
```

**Position Slot Management:**
- After creating internship, `available_slots` is decreased by 1
- Minimum value is 0 (cannot go negative)
- Position status automatically updates to `full` when slots reach 0 (via Position model hook)

### 7. Get Applications List

**Endpoint:** `GET /api/applications`

**Authentication:** Required (All roles)

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected)

**Role-Based Filtering:**
- **Students:** Can only see their own applications
- **Teachers:** Can see all applications
- **Enterprises:** Can see applications for their positions (future implementation)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "pending",
      "applied_at": "2024-01-01T00:00:00.000Z",
      "student": { ... },
      "position": { ... }
    }
  ],
  "message": "获取申请列表成功",
  "timestamp": 1640000000000
}
```

### 8. Get Application Details

**Endpoint:** `GET /api/applications/:id`

**Authentication:** Required (All roles)

**Authorization:**
- Students can only view their own applications
- Teachers can view all applications
- Returns 403 Forbidden if student tries to view another student's application

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "personal_statement": "...",
    "contact_info": "...",
    "applied_at": "2024-01-01T00:00:00.000Z",
    "student": { ... },
    "position": { ... },
    "reviewer": { ... }
  },
  "message": "获取申请详情成功",
  "timestamp": 1640000000000
}
```

## Error Handling

### Validation Errors (400)

**Empty Required Fields:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      { "field": "personal_statement", "message": "个人简介不能为空" },
      { "field": "contact_info", "message": "联系方式不能为空" }
    ]
  },
  "timestamp": 1640000000000
}
```

**Missing Rejection Reason:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      { "field": "rejection_reason", "message": "拒绝原因不能为空" }
    ]
  },
  "timestamp": 1640000000000
}
```

### Authorization Errors (403)

**Student Viewing Other's Application:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您没有权限查看此申请"
  },
  "timestamp": 1640000000000
}
```

### Not Found Errors (404)

**Application Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "请求的申请不存在"
  },
  "timestamp": 1640000000000
}
```

**Position Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "请求的实习岗位不存在"
  },
  "timestamp": 1640000000000
}
```

### Business Logic Errors (409)

**Duplicate Application:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "您已经有待审批或已通过的申请，不能重复申请"
  },
  "timestamp": 1640000000000
}
```

**Position Full:**
```json
{
  "success": false,
  "error": {
    "code": "POSITION_FULL",
    "message": "该岗位名额已满，无法申请"
  },
  "timestamp": 1640000000000
}
```

**Invalid Status for Approval:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "只能审批待审批状态的申请"
  },
  "timestamp": 1640000000000
}
```

## Transaction Management

All write operations use database transactions to ensure data consistency:

1. **Application Submission:**
   - Create application record
   - Create notifications for all teachers
   - Commit or rollback as a single transaction

2. **Application Approval:**
   - Update application status
   - Create internship record
   - Decrease position available slots
   - Create notifications for student and enterprise
   - Commit or rollback as a single transaction

3. **Application Rejection:**
   - Update application status
   - Record rejection reason
   - Create notification for student
   - Commit or rollback as a single transaction

This ensures that if any step fails, all changes are rolled back and the database remains in a consistent state (Requirement 10.3).

## Testing

### Unit Tests

32 unit tests have been implemented covering:
- Application data validation
- Application status management
- Duplicate application prevention
- Position availability checks
- Rejection reason validation
- Approval record integrity
- Internship record creation
- Notification creation
- Authorization checks

**Run tests:**
```bash
npm test -- applicationController.test.js
```

**Test Results:**
- All 32 tests passing
- Coverage includes all business rules and validation logic

### Manual Testing

A manual test script is provided at `backend/test-applications.js` that tests:
1. Student registration and login
2. Teacher registration and login
3. Application submission
4. Duplicate application prevention
5. Application listing (student and teacher views)
6. Application details retrieval
7. Application approval
8. Internship record creation
9. Position slot decrease verification
10. Application rejection with reason validation

**Run manual tests:**
```bash
node test-applications.js
```

## Database Schema

### Applications Table

```sql
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  position_id INT NOT NULL,
  teacher_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  personal_statement TEXT NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  rejection_reason TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES teachers(id) ON DELETE SET NULL
);
```

## API Routes Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/applications | ✓ | Student | Submit application |
| GET | /api/applications | ✓ | All | Get applications list |
| GET | /api/applications/:id | ✓ | All | Get application details |
| PUT | /api/applications/:id/approve | ✓ | Teacher | Approve application |
| PUT | /api/applications/:id/reject | ✓ | Teacher | Reject application |

## Implementation Files

- **Controller:** `backend/src/controllers/applicationController.js`
- **Routes:** `backend/src/routes/applications.js`
- **Model:** `backend/src/models/Application.js`
- **Tests:** `backend/src/controllers/__tests__/applicationController.test.js`
- **Manual Test:** `backend/test-applications.js`

## Next Steps

The following optional tasks can be implemented to add property-based testing:
- Task 6.2: Write property tests for application submission
- Task 6.4: Write property tests for business rules
- Task 6.6: Write property tests for notifications
- Task 6.8: Write property tests for approval/rejection
- Task 6.10: Write property tests for internship creation

These tests would use a property-based testing library like `fast-check` to validate the correctness properties defined in the design document.
