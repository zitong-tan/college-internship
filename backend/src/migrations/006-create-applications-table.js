module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'positions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      personal_statement: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      contact_info: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }
    });

    // Add indexes
    await queryInterface.addIndex('applications', ['student_id']);
    await queryInterface.addIndex('applications', ['position_id']);
    await queryInterface.addIndex('applications', ['teacher_id']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['applied_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('applications');
  }
};
