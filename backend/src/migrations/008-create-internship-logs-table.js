module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('internship_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      internship_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'internships',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      log_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('internship_logs', ['internship_id']);
    await queryInterface.addIndex('internship_logs', ['log_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('internship_logs');
  }
};
