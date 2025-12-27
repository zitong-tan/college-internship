const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  student_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  class_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'students',
  timestamps: false
});

module.exports = Student;
