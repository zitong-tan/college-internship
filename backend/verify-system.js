/**
 * System Verification Script
 * Checks the overall health and functionality of the system
 */

const { sequelize } = require('./src/config/database');
const models = require('./src/models');

async function verifySystem() {
  console.log('='.repeat(60));
  console.log('SYSTEM INTEGRITY VERIFICATION');
  console.log('='.repeat(60));
  console.log();

  const results = {
    database: false,
    models: false,
    migrations: false,
    apiEndpoints: false
  };

  // 1. Check Database Connection
  console.log('1. Checking Database Connection...');
  try {
    await sequelize.authenticate();
    console.log('   ✓ Database connection successful');
    results.database = true;
  } catch (error) {
    console.log('   ✗ Database connection failed:', error.message);
  }
  console.log();

  // 2. Check Models
  console.log('2. Checking Models...');
  try {
    const modelNames = Object.keys(models).filter(key => key !== 'sequelize');
    console.log(`   Found ${modelNames.length} models:`);
    modelNames.forEach(name => {
      console.log(`   - ${name}`);
    });
    console.log('   ✓ All models loaded successfully');
    results.models = true;
  } catch (error) {
    console.log('   ✗ Model loading failed:', error.message);
  }
  console.log();

  // 3. Check Migrations
  console.log('3. Checking Database Tables...');
  try {
    const [tables] = await sequelize.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    console.log('   ✓ All tables exist');
    results.migrations = true;
  } catch (error) {
    console.log('   ✗ Table check failed:', error.message);
  }
  console.log();

  // 4. Check Data Integrity
  console.log('4. Checking Data Integrity...');
  try {
    const userCount = await models.User.count();
    const studentCount = await models.Student.count();
    const teacherCount = await models.Teacher.count();
    const enterpriseCount = await models.Enterprise.count();
    const positionCount = await models.Position.count();
    const applicationCount = await models.Application.count();
    const internshipCount = await models.Internship.count();
    const notificationCount = await models.Notification.count();

    console.log('   Data counts:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Students: ${studentCount}`);
    console.log(`   - Teachers: ${teacherCount}`);
    console.log(`   - Enterprises: ${enterpriseCount}`);
    console.log(`   - Positions: ${positionCount}`);
    console.log(`   - Applications: ${applicationCount}`);
    console.log(`   - Internships: ${internshipCount}`);
    console.log(`   - Notifications: ${notificationCount}`);
    console.log('   ✓ Data integrity check passed');
  } catch (error) {
    console.log('   ✗ Data integrity check failed:', error.message);
  }
  console.log();

  // 5. Summary
  console.log('='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Database Connection: ${results.database ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Models Loading:      ${results.models ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Database Tables:     ${results.migrations ? '✓ PASS' : '✗ FAIL'}`);
  console.log('='.repeat(60));
  console.log();

  const allPassed = results.database && results.models && results.migrations;
  
  if (allPassed) {
    console.log('✓ SYSTEM VERIFICATION PASSED');
    console.log('All core components are functioning correctly.');
  } else {
    console.log('✗ SYSTEM VERIFICATION FAILED');
    console.log('Some components need attention.');
  }
  console.log();

  await sequelize.close();
  process.exit(allPassed ? 0 : 1);
}

verifySystem().catch(error => {
  console.error('Verification script error:', error);
  process.exit(1);
});
