const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

const migrationsPath = path.join(__dirname, '../migrations');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Get all migration files
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    // Run each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`✓ Completed: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

const rollbackMigrations = async () => {
  try {
    console.log('Rolling back database migrations...');
    
    // Get all migration files in reverse order
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .reverse();
    
    console.log(`Found ${files.length} migration files`);
    
    // Run each migration rollback
    for (const file of files) {
      console.log(`Rolling back migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));
      await migration.down(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`✓ Rolled back: ${file}`);
    }
    
    console.log('All migrations rolled back successfully!');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};

module.exports = { runMigrations, rollbackMigrations };
