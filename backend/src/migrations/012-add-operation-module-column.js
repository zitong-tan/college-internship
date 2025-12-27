/**
 * Migration: Add operation_module column to operation_logs table
 * Fixes the missing column issue that prevents server startup
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists
    const [columns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM operation_logs LIKE 'operation_module'"
    );
    
    // Only add the column if it doesn't exist
    if (columns.length === 0) {
      await queryInterface.addColumn('operation_logs', 'operation_module', {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Module where operation occurred (e.g., auth, application, internship)'
      });
      
      // Add the index for operation_module
      await queryInterface.addIndex('operation_logs', ['operation_module']);
      
      console.log('Added operation_module column to operation_logs table');
    } else {
      console.log('operation_module column already exists in operation_logs table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column if it exists
    await queryInterface.removeColumn('operation_logs', 'operation_module');
  }
};