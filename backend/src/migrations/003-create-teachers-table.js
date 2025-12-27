module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teachers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      teacher_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      title: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('teachers', ['user_id']);
    await queryInterface.addIndex('teachers', ['teacher_number']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teachers');
  }
};
