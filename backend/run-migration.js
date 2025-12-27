const { runMigrations } = require('./src/utils/migrate');
const { sequelize } = require('./src/config/database');

async function main() {
  try {
    await runMigrations();
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

main();
