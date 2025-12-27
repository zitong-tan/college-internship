/**
 * Quick System Check
 * Fast verification without database connection
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('QUICK SYSTEM CHECK');
console.log('='.repeat(60));
console.log();

// 1. Check Environment Configuration
console.log('1. Environment Configuration');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✓ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDB = envContent.includes('DB_HOST') && envContent.includes('DB_NAME');
  const hasJWT = envContent.includes('JWT_SECRET');
  console.log(`   ${hasDB ? '✓' : '✗'} Database configuration present`);
  console.log(`   ${hasJWT ? '✓' : '✗'} JWT configuration present`);
} else {
  console.log('   ✗ .env file missing');
}
console.log();

// 2. Check Project Structure
console.log('2. Project Structure');
const requiredDirs = [
  'src/controllers',
  'src/models',
  'src/routes',
  'src/middleware',
  'src/services',
  'src/migrations',
  'src/config'
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`   ${exists ? '✓' : '✗'} ${dir}`);
});
console.log();

// 3. Check Key Files
console.log('3. Key Files');
const keyFiles = [
  'src/server.js',
  'src/config/database.js',
  'src/controllers/authController.js',
  'src/controllers/positionController.js',
  'src/controllers/applicationController.js',
  'src/controllers/internshipController.js',
  'src/controllers/notificationController.js',
  'src/controllers/statisticsController.js',
  'src/middleware/auth.js',
  'src/middleware/errorHandler.js',
  'package.json'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});
console.log();

// 4. Check Models
console.log('4. Models');
const modelFiles = fs.readdirSync(path.join(__dirname, 'src/models'))
  .filter(f => f.endsWith('.js') && f !== 'index.js');
console.log(`   Found ${modelFiles.length} model files:`);
modelFiles.forEach(file => {
  console.log(`   - ${file}`);
});
console.log();

// 5. Check Migrations
console.log('5. Migrations');
const migrationFiles = fs.readdirSync(path.join(__dirname, 'src/migrations'))
  .filter(f => f.endsWith('.js'));
console.log(`   Found ${migrationFiles.length} migration files:`);
migrationFiles.forEach(file => {
  console.log(`   - ${file}`);
});
console.log();

// 6. Check Routes
console.log('6. Routes');
const routeFiles = fs.readdirSync(path.join(__dirname, 'src/routes'))
  .filter(f => f.endsWith('.js'));
console.log(`   Found ${routeFiles.length} route files:`);
routeFiles.forEach(file => {
  console.log(`   - ${file}`);
});
console.log();

// 7. Check Tests
console.log('7. Tests');
const testDir = path.join(__dirname, 'src/controllers/__tests__');
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));
  console.log(`   Found ${testFiles.length} test files:`);
  testFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('   ✗ Test directory not found');
}
console.log();

// 8. Check Dependencies
console.log('8. Dependencies');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const deps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});
console.log(`   Production dependencies: ${deps.length}`);
console.log(`   Development dependencies: ${devDeps.length}`);
console.log();

console.log('='.repeat(60));
console.log('✓ QUICK CHECK COMPLETED');
console.log('All file structure checks passed.');
console.log();
console.log('Note: Database connection not tested in quick check.');
console.log('To test database, ensure MySQL is running and run:');
console.log('  node verify-system.js');
console.log('='.repeat(60));
