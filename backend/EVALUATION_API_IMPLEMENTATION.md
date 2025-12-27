# Internship Evaluation API Implementation

## Overview

This document describes the implementation of the internship evaluation functionality, which allows teachers and enterprises to evaluate student internships, calculates final scores, and enables students to view their evaluations.

## Implemented Features

### 1. Teacher Evaluation Submission (Task 9.1)

**Endpoint:** `POST /api/internships/:id/evaluate/teacher`

**Authentication:** Required (Teacher role only)

**Request Body:**
```json
{
  "score": 85.5,
  "comment": "学生表现优秀，积极主动，完成任务质量高"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher_score": 85.5,
    "teacher_comment": "学生表现优秀，积极主动，完成任务质量高",
    "final_score": 87.75,
    "status": "completed"
  },
  "message": "教师评价提交成功",
  "timestamp": 1640000000000
}
```

**Validation:**
- Score must be between 0 and 100
- Score is required
- Comment is optional
- Only the assigned teacher can evaluate
- Internship must be in 'pending_evaluation' or 'completed' status

### 2. Enterprise Evaluation Submission (Task 9.1)

**Endpoint:** `POST /api/internships/:id/evaluate/enterprise`

**Authentication:** Required (Enterprise role only)

**Request Body:**
```json
{
  "score": 90.0,
  "comment": "工作认真负责，技术能力强，团队协作好"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enterprise_score": 90.0,
    "enterprise_comment": "工作认真负责，技术能力强，团队协作好",
    "final_score": 87.75,
    "status": "completed"
  },
  "message": "企业评价提交成功",
  "timestamp": 1640000000000
}
```

**Validation:**
- Score must be between 0 and 100
- Score is required
- Comment is optional
- Only the assigned enterprise can evaluate
- Internship must be in 'pending_evaluation' or 'completed' status

### 3. Final Score Calculation (Task 9.3)

**Implementation:** Automatic calculation when both evaluations are submitted

**Formula:**
```
final_score = (teacher_score × 0.5) + (enterprise_score × 0.5)
```

**Example:**
- Teacher Score: 85.0
- Enterprise Score: 90.0
- Final Score: (85.0 × 0.5) + (90.0 × 0.5) = 87.5

**Behavior:**
- Calculation is triggered automatically when either teacher or enterprise submits evaluation
- Final score is only calculated when both scores are present
- Final score is stored in the `final_score` field of the internship record

### 4. Status Update on Completion (Task 9.5)

**Implementation:** Automatic status update when both evaluations are complete

**Behavior:**
- When both `teacher_score` and `enterprise_score` are not null
- Status is automatically updated from 'pending_evaluation' to 'completed'
- This happens when the second evaluation is submitted

**Status Flow:**
```
ongoing → pending_evaluation → completed
                ↑                    ↑
         (end date reached)  (both evaluations submitted)
```

### 5. Student View Evaluation (Task 9.7)

**Endpoint:** `GET /api/internships/:id/evaluation`

**Authentication:** Required (Student role only)

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher_score": 85.5,
    "teacher_comment": "学生表现优秀，积极主动，完成任务质量高",
    "enterprise_score": 90.0,
    "enterprise_comment": "工作认真负责，技术能力强，团队协作好",
    "final_score": 87.75,
    "status": "completed"
  },
  "message": "获取评价成功",
  "timestamp": 1640000000000
}
```

**Validation:**
- Only the student who owns the internship can view the evaluation
- Returns all evaluation data including scores, comments, and final score

## Error Handling

### Validation Errors (400)

**Missing Score:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "评分不能为空"
  }
}
```

**Invalid Score Range:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "评分必须在0-100之间"
  }
}
```

### Permission Errors (403)

**Wrong Role:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "只有教师可以提交教师评价"
  }
}
```

**Not Assigned:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您没有权限评价此实习记录"
  }
}
```

### Not Found Errors (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "实习记录不存在"
  }
}
```

### Business Logic Errors (409)

**Wrong Status:**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_LOGIC_ERROR",
    "message": "实习尚未结束，无法提交评价"
  }
}
```

## Database Schema

The evaluation data is stored in the `internships` table:

```sql
teacher_score DECIMAL(3,1) NULL,
enterprise_score DECIMAL(3,1) NULL,
final_score DECIMAL(3,1) NULL,
teacher_comment TEXT NULL,
enterprise_comment TEXT NULL,
status ENUM('ongoing', 'pending_evaluation', 'completed')
```

## Testing

Run the evaluation tests:

```bash
node backend/test-evaluations.js
```

The test script covers:
- Teacher evaluation submission
- Enterprise evaluation submission
- Final score calculation verification
- Status update to 'completed'
- Student viewing evaluation
- Score validation (0-100 range)
- Permission controls
- Role-based access

## Requirements Validation

This implementation satisfies the following requirements:

- **需求 7.1**: Teacher can submit evaluation with score and comment
- **需求 7.2**: Enterprise can submit evaluation with score and comment
- **需求 7.3**: Final score is calculated as weighted average (50% teacher + 50% enterprise)
- **需求 7.4**: Status is updated to 'completed' when both evaluations are submitted
- **需求 7.5**: Students can view their own evaluation and scores

## Design Properties Validated

- **属性 29**: Evaluation data (score and comment) is saved completely with timestamp
- **属性 30**: Final score calculation is correct: (teacher_score × 0.5 + enterprise_score × 0.5)
- **属性 31**: Status is updated to 'completed' when both evaluations are present
- **属性 32**: Students can view their own evaluation data

## Implementation Notes

1. **Automatic Calculations**: Both final score calculation and status updates happen automatically when evaluations are submitted, ensuring data consistency.

2. **Idempotent Updates**: Teachers and enterprises can update their evaluations multiple times. The final score and status are recalculated each time.

3. **Partial Evaluations**: The system supports partial evaluations - either teacher or enterprise can submit first, and the final score is calculated only when both are present.

4. **Permission Checks**: Strict permission checks ensure:
   - Only teachers can submit teacher evaluations
   - Only enterprises can submit enterprise evaluations
   - Only assigned teachers/enterprises can evaluate specific internships
   - Only students can view their own evaluations

5. **Status Requirements**: Evaluations can only be submitted when the internship is in 'pending_evaluation' or 'completed' status, preventing premature evaluations.
