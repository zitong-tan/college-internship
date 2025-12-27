const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * OperationLog Model
 * Stores logs of critical operations for audit purposes
 * Matches existing database table structure
 */
const OperationLog = sequelize.define('OperationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User who performed the operation'
  },
  operation_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type of operation (e.g., login, application_approve, evaluation_submit)'
  },
  operation_desc: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'operation_desc',
    comment: 'Detailed description of the operation'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent string'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'operation_logs',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['operation_type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = OperationLog;
