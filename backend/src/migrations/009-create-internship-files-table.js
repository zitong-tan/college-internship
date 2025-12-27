module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('internship_files', {
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
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('internship_files', ['internship_id']);
    await queryInterface.addIndex('internship_files', ['uploaded_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('internship_files');
  }
};
