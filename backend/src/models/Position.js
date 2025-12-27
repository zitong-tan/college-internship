const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Position = sequelize.define('Position', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_slots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  available_slots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (this.start_date && value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('open', 'full', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  }
}, {
  tableName: 'positions',
  timestamps: true,
  hooks: {
    beforeSave: (position) => {
      // Auto-update status when slots are full
      if (position.available_slots === 0 && position.status === 'open') {
        position.status = 'full';
      }
      
      // Auto-reopen position when slots become available again
      if (position.available_slots > 0 && position.status === 'full') {
        position.status = 'open';
      }
      
      // Check if position is expired
      const currentDate = new Date().toISOString().split('T')[0];
      if (position.end_date < currentDate && position.status !== 'closed') {
        position.status = 'closed';
      }
    }
  }
});

module.exports = Position;
