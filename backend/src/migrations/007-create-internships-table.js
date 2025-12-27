module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('internships', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'applications',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      enterprise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'enterprises',
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
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ongoing', 'pending_evaluation', 'completed'),
        allowNull: false,
        defaultValue: 'ongoing'
      },
      teacher_score: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true
      },
      enterprise_score: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true
      },
      final_score: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true
      },
      teacher_comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      enterprise_comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('internships', ['application_id']);
    await queryInterface.addIndex('internships', ['student_id']);
    await queryInterface.addIndex('internships', ['position_id']);
    await queryInterface.addIndex('internships', ['enterprise_id']);
    await queryInterface.addIndex('internships', ['teacher_id']);
    await queryInterface.addIndex('internships', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('internships');
  }
};
