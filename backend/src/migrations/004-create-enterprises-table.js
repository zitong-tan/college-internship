module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enterprises', {
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
      company_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      industry: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('enterprises', ['user_id']);
    await queryInterface.addIndex('enterprises', ['company_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('enterprises');
  }
};
