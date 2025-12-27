const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Internship = sequelize.define('Internship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'applications',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'positions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  enterprise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'enterprises',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'pending_evaluation', 'completed'),
    allowNull: false,
    defaultValue: 'ongoing'
  },
  teacher_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  enterprise_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  final_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  teacher_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  enterprise_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'internships',
  timestamps: true
});

module.exports = Internship;
