/**
 * Migration: Create operation_logs table
 * This table stores logs of critical operations for audit purposes
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('operation_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the operation'
      },
      operation_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of operation (e.g., login, application_approve, evaluation_submit)'
      },
      operation_module: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Module where operation occurred (e.g., auth, application, internship)'
      },
      operation_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Detailed description of the operation'
      },
      target_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of target entity (e.g., application, internship, position)'
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the target entity'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the user'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string'
      },
      request_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Request data (sanitized)'
      },
      response_status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Response status (success, error)'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if operation failed'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for common queries
    await queryInterface.addIndex('operation_logs', ['user_id']);
    await queryInterface.addIndex('operation_logs', ['operation_type']);
    await queryInterface.addIndex('operation_logs', ['operation_module']);
    await queryInterface.addIndex('operation_logs', ['created_at']);
    await queryInterface.addIndex('operation_logs', ['target_type', 'target_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('operation_logs');
  }
};
