const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternshipLog = sequelize.define('InternshipLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  internship_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'internships',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  log_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'internship_logs',
  timestamps: false
});

module.exports = InternshipLog;
