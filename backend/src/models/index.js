const { sequelize } = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Enterprise = require('./Enterprise');
const Position = require('./Position');
const Application = require('./Application');
const Internship = require('./Internship');
const InternshipLog = require('./InternshipLog');
const InternshipFile = require('./InternshipFile');
const Notification = require('./Notification');
const OperationLog = require('./OperationLog');

// Define associations

// User associations
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacherProfile' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(Enterprise, { foreignKey: 'user_id', as: 'enterpriseProfile' });
Enterprise.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Position associations
Enterprise.hasMany(Position, { foreignKey: 'enterprise_id', as: 'positions' });
Position.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'Enterprise' });

// Application associations
Student.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Application.belongsTo(Student, { foreignKey: 'student_id', as: 'Student' });

Position.hasMany(Application, { foreignKey: 'position_id', as: 'applications' });
Application.belongsTo(Position, { foreignKey: 'position_id', as: 'Position' });

Teacher.hasMany(Application, { foreignKey: 'teacher_id', as: 'assignedApplications' });
Application.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'Teacher' });

Teacher.hasMany(Application, { foreignKey: 'reviewed_by', as: 'reviewedApplications' });
Application.belongsTo(Teacher, { foreignKey: 'reviewed_by', as: 'reviewer' });

// Internship associations
Application.hasOne(Internship, { foreignKey: 'application_id', as: 'internship' });
Internship.belongsTo(Application, { foreignKey: 'application_id', as: 'Application' });

Student.hasMany(Internship, { foreignKey: 'student_id', as: 'internships' });
Internship.belongsTo(Student, { foreignKey: 'student_id', as: 'Student' });

Position.hasMany(Internship, { foreignKey: 'position_id', as: 'internships' });
Internship.belongsTo(Position, { foreignKey: 'position_id', as: 'Position' });

Enterprise.hasMany(Internship, { foreignKey: 'enterprise_id', as: 'internships' });
Internship.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'Enterprise' });

Teacher.hasMany(Internship, { foreignKey: 'teacher_id', as: 'supervisedInternships' });
Internship.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'Teacher' });

// Internship logs and files associations
Internship.hasMany(InternshipLog, { foreignKey: 'internship_id', as: 'logs' });
InternshipLog.belongsTo(Internship, { foreignKey: 'internship_id', as: 'internship' });

Internship.hasMany(InternshipFile, { foreignKey: 'internship_id', as: 'files' });
InternshipFile.belongsTo(Internship, { foreignKey: 'internship_id', as: 'internship' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// OperationLog associations
User.hasMany(OperationLog, { foreignKey: 'user_id', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Enterprise,
  Position,
  Application,
  Internship,
  InternshipLog,
  InternshipFile,
  Notification,
  OperationLog
};
