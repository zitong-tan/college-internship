const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'enterprise'),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
  // 移除密码加密钩子，使用明文密码
});

// 简单密码验证 - 直接比较明文
User.prototype.verifyPassword = function(password) {
  return this.password_hash === password;
};

module.exports = User;
