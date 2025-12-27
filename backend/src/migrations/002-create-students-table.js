module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
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
      student_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      major: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      grade: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      class_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('students', ['user_id']);
    await queryInterface.addIndex('students', ['student_number']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('students');
  }
};
