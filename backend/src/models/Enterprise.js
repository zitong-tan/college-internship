const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enterprise = sequelize.define('Enterprise', {
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
  company_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'enterprises',
  timestamps: false
});

module.exports = Enterprise;
