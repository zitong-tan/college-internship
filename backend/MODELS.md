# Database Models Documentation

## Overview

This document describes the Sequelize models implemented for the University Internship Management System.

## Models

### User Model
**File:** `src/models/User.js`
**Table:** `users`

Base user model for all user types (students, teachers, enterprises).

**Fields:**
- `id` - Primary key
- `username` - Unique username (3-50 characters, alphanumeric)
- `password_hash` - Encrypted password (bcrypt)
- `role` - User role (student, teacher, enterprise)
- `email` - Unique email address
- `phone` - Optional phone number
- `real_name` - User's real name
- `created_at`, `updated_at` - Timestamps

**Features:**
- Automatic password hashing on create/update
- `verifyPassword()` instance method for authentication
- Validates username format and email

### Student Model
**File:** `src/models/Student.js`
**Table:** `students`

Student profile information linked to User.

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users (unique, cascade delete)
- `student_number` - Unique student ID
- `major` - Student's major
- `grade` - Student's grade/year
- `class_name` - Student's class

### Teacher Model
**File:** `src/models/Teacher.js`
**Table:** `teachers`

Teacher profile information linked to User.

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users (unique, cascade delete)
- `teacher_number` - Unique teacher ID
- `department` - Teacher's department
- `title` - Academic title

### Enterprise Model
**File:** `src/models/Enterprise.js`
**Table:** `enterprises`

Enterprise profile information linked to User.

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users (unique, cascade delete)
- `company_name` - Company name
- `industry` - Industry sector
- `address` - Company address
- `website` - Company website URL

### Position Model
**File:** `src/models/Position.js`
**Table:** `positions`

Internship positions posted by enterprises.

**Fields:**
- `id` - Primary key
- `enterprise_id` - Foreign key to enterprises
- `title` - Position title (required, max 200 chars)
- `description` - Position description (required)
- `requirements` - Position requirements
- `total_slots` - Total available slots (min 1)
- `available_slots` - Currently available slots (min 0)
- `start_date` - Internship start date
- `end_date` - Internship end date (must be after start_date)
- `status` - Position status (open, full, closed)
- `created_at`, `updated_at` - Timestamps

**Features:**
- Automatic status update to 'full' when available_slots reaches 0
- Validates end_date is after start_date

### Application Model
**File:** `src/models/Application.js`
**Table:** `applications`

Student applications for internship positions.

**Fields:**
- `id` - Primary key
- `student_id` - Foreign key to students
- `position_id` - Foreign key to positions
- `teacher_id` - Foreign key to teachers (optional)
- `status` - Application status (pending, approved, rejected)
- `personal_statement` - Student's personal statement (required)
- `contact_info` - Contact information (required)
- `rejection_reason` - Reason for rejection (if rejected)
- `applied_at` - Application timestamp
- `reviewed_at` - Review timestamp
- `reviewed_by` - Foreign key to teachers (reviewer)

### Internship Model
**File:** `src/models/Internship.js`
**Table:** `internships`

Active internship records created from approved applications.

**Fields:**
- `id` - Primary key
- `application_id` - Foreign key to applications (unique)
- `student_id` - Foreign key to students
- `position_id` - Foreign key to positions
- `enterprise_id` - Foreign key to enterprises
- `teacher_id` - Foreign key to teachers (supervisor)
- `start_date` - Internship start date
- `end_date` - Internship end date
- `status` - Internship status (ongoing, pending_evaluation, completed)
- `teacher_score` - Teacher's evaluation score (0-100)
- `enterprise_score` - Enterprise's evaluation score (0-100)
- `final_score` - Final calculated score (0-100)
- `teacher_comment` - Teacher's evaluation comment
- `enterprise_comment` - Enterprise's evaluation comment
- `created_at`, `updated_at` - Timestamps

### InternshipLog Model
**File:** `src/models/InternshipLog.js`
**Table:** `internship_logs`

Daily logs submitted by students during internship.

**Fields:**
- `id` - Primary key
- `internship_id` - Foreign key to internships
- `content` - Log content (required)
- `log_date` - Date of the log entry
- `created_at` - Creation timestamp

### InternshipFile Model
**File:** `src/models/InternshipFile.js`
**Table:** `internship_files`

Files uploaded by students during internship.

**Fields:**
- `id` - Primary key
- `internship_id` - Foreign key to internships
- `file_name` - Original file name
- `file_path` - Storage path
- `file_size` - File size in bytes (max 10MB)
- `file_type` - File MIME type (pdf, doc, docx, jpg, png)
- `uploaded_at` - Upload timestamp

**Features:**
- Validates file size (max 10MB)
- Validates file type

### Notification Model
**File:** `src/models/Notification.js`
**Table:** `notifications`

System notifications for users.

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Notification title (required)
- `content` - Notification content (required)
- `type` - Notification type
- `is_read` - Read status (default: false)
- `created_at` - Creation timestamp

## Model Associations

### User Associations
- User `hasOne` Student (as 'studentProfile')
- User `hasOne` Teacher (as 'teacherProfile')
- User `hasOne` Enterprise (as 'enterpriseProfile')
- User `hasMany` Notification (as 'notifications')

### Enterprise Associations
- Enterprise `hasMany` Position (as 'positions')
- Enterprise `hasMany` Internship (as 'internships')

### Position Associations
- Position `belongsTo` Enterprise
- Position `hasMany` Application (as 'applications')
- Position `hasMany` Internship (as 'internships')

### Student Associations
- Student `belongsTo` User
- Student `hasMany` Application (as 'applications')
- Student `hasMany` Internship (as 'internships')

### Teacher Associations
- Teacher `belongsTo` User
- Teacher `hasMany` Application (as 'assignedApplications')
- Teacher `hasMany` Application (as 'reviewedApplications')
- Teacher `hasMany` Internship (as 'supervisedInternships')

### Application Associations
- Application `belongsTo` Student
- Application `belongsTo` Position
- Application `belongsTo` Teacher (as 'teacher')
- Application `belongsTo` Teacher (as 'reviewer')
- Application `hasOne` Internship

### Internship Associations
- Internship `belongsTo` Application
- Internship `belongsTo` Student
- Internship `belongsTo` Position
- Internship `belongsTo` Enterprise
- Internship `belongsTo` Teacher
- Internship `hasMany` InternshipLog (as 'logs')
- Internship `hasMany` InternshipFile (as 'files')

### Notification Associations
- Notification `belongsTo` User

## Usage

All models are exported from `src/models/index.js`:

```javascript
const {
  User,
  Student,
  Teacher,
  Enterprise,
  Position,
  Application,
  Internship,
  InternshipLog,
  InternshipFile,
  Notification
} = require('./models');
```

## Database Migrations

Run migrations to create all tables:

```bash
npm run migrate
```

Rollback migrations:

```bash
npm run migrate:rollback
```

See `src/migrations/README.md` for more details.
