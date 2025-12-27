# Internship Management API Implementation

## Overview

This document describes the implementation of the internship process management API, including logs, files, progress tracking, and status updates.

## Implemented Features

### 1. Internship Log Management (Task 8.1)

**Submit Internship Log**
- **Endpoint**: `POST /api/internships/:id/logs`
- **Authentication**: Required (Student only)
- **Description**: Allows students to submit daily internship logs
- **Request Body**:
  ```json
  {
    "content": "今天完成了项目的需求分析",
    "log_date": "2024-01-15"
  }
  ```
- **Response**: Created log record with ID and timestamp
- **Validation**: 
  - Content and log_date are required
  - Only the student assigned to the internship can submit logs

**Get Internship Logs**
- **Endpoint**: `GET /api/internships/:id/logs`
- **Authentication**: Required (Student, Teacher)
- **Description**: Retrieves all logs for an internship
- **Response**: Array of logs ordered by date (newest first)
- **Access Control**:
  - Students can view their own logs
  - Teachers can view logs of students they supervise

### 2. File Upload Management (Task 8.3)

**Upload Internship File**
- **Endpoint**: `POST /api/internships/:id/files`
- **Authentication**: Required (Student only)
- **Description**: Allows students to upload internship-related files
- **Content-Type**: `multipart/form-data`
- **File Field**: `file`
- **Validation**:
  - Maximum file size: 10MB
  - Allowed formats: PDF, DOC, DOCX, JPG, JPEG, PNG
  - File type validation by extension and MIME type
- **Response**: File record with metadata
- **Storage**: Files are stored in `backend/uploads/` directory

**Get Internship Files**
- **Endpoint**: `GET /api/internships/:id/files`
- **Authentication**: Required (Student, Teacher)
- **Description**: Retrieves list of uploaded files
- **Response**: Array of file metadata (excludes file paths for security)
- **Access Control**:
  - Students can view their own files
  - Teachers can view files of students they supervise

### 3. Progress Calculation (Task 8.5)

**Get Internship Progress**
- **Endpoint**: `GET /api/internships/:id/progress`
- **Authentication**: Required (Student, Teacher)
- **Description**: Calculates and returns internship progress
- **Response**:
  ```json
  {
    "total_days": 90,
    "completed_days": 45,
    "percentage": 50,
    "is_completed": false
  }
  ```
- **Calculation**:
  - `completed_days = (current_date - start_date) / (1 day)`
  - `percentage = (completed_days / total_days) * 100`
  - Capped at 100%
  - Progress is also included in internship details response

### 4. Status Auto-Update (Task 8.7)

**Automatic Status Transition**
- **Trigger**: When accessing internship data
- **Logic**: 
  - If internship status is 'ongoing' and current date >= end_date
  - Automatically update status to 'pending_evaluation'
- **Implementation**: 
  - `checkAndUpdateStatus()` function called in `getInternship()`
  - Ensures status is always current when viewed

**Manual Status Update**
- **Endpoint**: `POST /api/internships/update-expired`
- **Authentication**: Required (Teacher only)
- **Description**: Manually triggers batch update of all expired internships
- **Response**: Number of internships updated and their IDs
- **Use Case**: Can be called by scheduled job or manually by teachers

### 5. Teacher Access Permissions (Task 8.9)

**Access Control Implementation**
- Teachers can view logs and files of students they supervise
- Permission checks in all relevant endpoints:
  - `getLogs()`: Verifies teacher is assigned to the internship
  - `getFiles()`: Verifies teacher is assigned to the internship
  - `getInternship()`: Verifies teacher is assigned to the internship
  - `getProgress()`: Verifies teacher is assigned to the internship

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/internships` | ✓ | Student, Teacher | Get internship list |
| GET | `/api/internships/:id` | ✓ | Student, Teacher | Get internship details with progress |
| GET | `/api/internships/:id/progress` | ✓ | Student, Teacher | Get progress calculation |
| POST | `/api/internships/:id/logs` | ✓ | Student | Submit internship log |
| GET | `/api/internships/:id/logs` | ✓ | Student, Teacher | Get internship logs |
| POST | `/api/internships/:id/files` | ✓ | Student | Upload file |
| GET | `/api/internships/:id/files` | ✓ | Student, Teacher | Get file list |
| POST | `/api/internships/update-expired` | ✓ | Teacher | Update expired internships |

## Data Models

### InternshipLog
```javascript
{
  id: INTEGER,
  internship_id: INTEGER,
  content: TEXT (required),
  log_date: DATE (required),
  created_at: TIMESTAMP
}
```

### InternshipFile
```javascript
{
  id: INTEGER,
  internship_id: INTEGER,
  file_name: STRING,
  file_path: STRING,
  file_size: INTEGER (max 10MB),
  file_type: STRING (pdf, doc, docx, jpg, png),
  uploaded_at: TIMESTAMP
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": 1640000000000
}
```

Common error codes:
- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `INTERNAL_ERROR` (500): Server error

## File Upload Implementation

The file upload is implemented using a custom middleware (`backend/src/middleware/upload.js`) that:
1. Parses multipart/form-data without external dependencies
2. Validates file size and type
3. Generates unique filenames to prevent conflicts
4. Stores files in the `backend/uploads/` directory
5. Attaches file metadata to the request object

## Progress Calculation Algorithm

```javascript
function calculateProgress(internship) {
  const now = new Date();
  const startDate = new Date(internship.start_date);
  const endDate = new Date(internship.end_date);
  
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  let completedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  
  // Clamp values
  completedDays = Math.max(0, Math.min(completedDays, totalDays));
  
  const percentage = totalDays > 0 
    ? Math.min(100, Math.round((completedDays / totalDays) * 100)) 
    : 0;
  
  return {
    total_days: totalDays,
    completed_days: completedDays,
    percentage: percentage,
    is_completed: completedDays >= totalDays
  };
}
```

## Status Update Logic

```javascript
async function checkAndUpdateStatus(internship) {
  if (internship.status === 'ongoing') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endDate = new Date(internship.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < now) {
      await internship.update({ status: 'pending_evaluation' });
      return true;
    }
  }
  return false;
}
```

## Testing

Run the test script to verify all endpoints:

```bash
node backend/test-internships.js
```

**Prerequisites**:
- Server must be running on port 3000
- Test users must exist (student1, teacher1)
- At least one internship record must exist

## Requirements Validation

This implementation satisfies the following requirements:

- **需求 6.1**: ✓ Students can submit and view internship logs
- **需求 6.2**: ✓ File upload with format and size validation
- **需求 6.3**: ✓ Progress calculation showing completed days and percentage
- **需求 6.4**: ✓ Automatic status transition when internship expires
- **需求 6.5**: ✓ Teachers can access student logs and files

## Future Enhancements

1. Add file download endpoint
2. Implement file deletion (with proper authorization)
3. Add pagination for logs and files
4. Implement real-time notifications for status changes
5. Add scheduled job for automatic status updates
6. Implement enterprise user access to files
7. Add file preview functionality
8. Implement log editing/deletion (within time window)

## Security Considerations

1. **File Upload Security**:
   - File size limits enforced
   - File type validation (extension + MIME type)
   - Unique filenames prevent overwrites
   - Files stored outside web root

2. **Access Control**:
   - All endpoints require authentication
   - Role-based access control enforced
   - Users can only access their own data or supervised data

3. **Data Validation**:
   - All inputs validated before processing
   - SQL injection prevented by Sequelize ORM
   - XSS prevention through proper data handling

## Notes

- The file upload middleware is implemented without external dependencies (no multer)
- Status updates happen automatically when viewing internship data
- Teachers can manually trigger batch status updates
- Progress is calculated in real-time based on current date
- All dates are compared at day granularity (time component ignored)
