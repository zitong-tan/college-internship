const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternshipFile = sequelize.define('InternshipFile', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 10485760 // 10MB in bytes
    }
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']]
    }
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'internship_files',
  timestamps: false
});

module.exports = InternshipFile;
