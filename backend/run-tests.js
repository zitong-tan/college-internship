/**
 * Simple test runner script
 * Run with: node run-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running tests...\n');
  
  // Change to backend directory and run jest
  const jestPath = path.join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');
  execSync(`node "${jestPath}" --runInBand`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
}
