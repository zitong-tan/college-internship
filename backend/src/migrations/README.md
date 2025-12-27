# Database Migrations

This directory contains database migration scripts for the University Internship Management System.

## Migration Files

Migrations are numbered sequentially and should be run in order:

1. `001-create-users-table.js` - Creates the users table
2. `002-create-students-table.js` - Creates the students table
3. `003-create-teachers-table.js` - Creates the teachers table
4. `004-create-enterprises-table.js` - Creates the enterprises table
5. `005-create-positions-table.js` - Creates the positions table
6. `006-create-applications-table.js` - Creates the applications table
7. `007-create-internships-table.js` - Creates the internships table
8. `008-create-internship-logs-table.js` - Creates the internship_logs table
9. `009-create-internship-files-table.js` - Creates the internship_files table
10. `010-create-notifications-table.js` - Creates the notifications table

## Running Migrations

### Run all migrations
```bash
npm run migrate
```

### Rollback all migrations
```bash
npm run migrate:rollback
```

## Database Schema

The migrations create the following tables with their relationships:

- **users** - Base user table for all user types
- **students** - Student profile information (1:1 with users)
- **teachers** - Teacher profile information (1:1 with users)
- **enterprises** - Enterprise profile information (1:1 with users)
- **positions** - Internship positions posted by enterprises
- **applications** - Student applications for positions
- **internships** - Active internship records
- **internship_logs** - Daily logs submitted by students
- **internship_files** - Files uploaded by students
- **notifications** - System notifications for users

## Notes

- All migrations include proper foreign key constraints
- Indexes are created for frequently queried columns
- Timestamps are automatically managed for most tables
- Cascading deletes are configured where appropriate
