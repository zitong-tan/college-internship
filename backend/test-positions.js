/**
 * Manual test script for position endpoints
 * This script tests the position CRUD operations
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
let authToken = '';
let enterpriseUserId = '';
let positionId = '';

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${testName}`);
  if (message) {
    console.log(`  ${message}`);
  }
}

// Test 1: Register an enterprise user
async function testRegisterEnterprise() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username: `enterprise_${Date.now()}`,
      password: 'password123',
      email: `enterprise_${Date.now()}@test.com`,
      role: 'enterprise',
      real_name: 'Test Enterprise',
      phone: '13800138000',
      company_name: 'Test Company',
      industry: 'Technology'
    });

    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      enterpriseUserId = response.data.data.user.id;
      logTest('Register Enterprise User', true, `User ID: ${enterpriseUserId}`);
      return true;
    } else {
      logTest('Register Enterprise User', false, 'No token received');
      return false;
    }
  } catch (error) {
    logTest('Register Enterprise User', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 2: Create a position
async function testCreatePosition() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/positions`,
      {
        title: 'Frontend Developer Intern',
        description: 'Looking for a passionate frontend developer intern to join our team',
        requirements: 'React, JavaScript, HTML, CSS',
        total_slots: 5,
        start_date: '2024-07-01',
        end_date: '2024-12-31'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success && response.data.data.id) {
      positionId = response.data.data.id;
      logTest('Create Position', true, `Position ID: ${positionId}`);
      return true;
    } else {
      logTest('Create Position', false, 'No position ID received');
      return false;
    }
  } catch (error) {
    logTest('Create Position', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 3: Get positions list
async function testGetPositions() {
  try {
    const response = await axios.get(`${API_BASE_URL}/positions`);

    if (response.data.success && Array.isArray(response.data.data.positions)) {
      logTest('Get Positions List', true, `Found ${response.data.data.positions.length} positions`);
      return true;
    } else {
      logTest('Get Positions List', false, 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Get Positions List', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 4: Get position by ID
async function testGetPositionById() {
  try {
    const response = await axios.get(`${API_BASE_URL}/positions/${positionId}`);

    if (response.data.success && response.data.data.id === positionId) {
      logTest('Get Position By ID', true, `Title: ${response.data.data.title}`);
      return true;
    } else {
      logTest('Get Position By ID', false, 'Position not found or invalid data');
      return false;
    }
  } catch (error) {
    logTest('Get Position By ID', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 5: Search positions by keyword
async function testSearchPositions() {
  try {
    const response = await axios.get(`${API_BASE_URL}/positions?keyword=Frontend`);

    if (response.data.success && Array.isArray(response.data.data.positions)) {
      const hasKeyword = response.data.data.positions.every(pos => 
        pos.title.includes('Frontend') || pos.description.includes('Frontend')
      );
      logTest('Search Positions', hasKeyword, `Found ${response.data.data.positions.length} matching positions`);
      return hasKeyword;
    } else {
      logTest('Search Positions', false, 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Search Positions', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 6: Update position
async function testUpdatePosition() {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/positions/${positionId}`,
      {
        title: 'Senior Frontend Developer Intern',
        total_slots: 3
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success && response.data.data.title === 'Senior Frontend Developer Intern') {
      logTest('Update Position', true, 'Position updated successfully');
      return true;
    } else {
      logTest('Update Position', false, 'Update failed');
      return false;
    }
  } catch (error) {
    logTest('Update Position', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 7: Validate position data (should fail)
async function testValidatePositionData() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/positions`,
      {
        title: '', // Empty title should fail
        description: 'Test',
        total_slots: 5,
        start_date: '2024-07-01',
        end_date: '2024-12-31'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logTest('Validate Position Data', false, 'Should have rejected empty title');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'VALIDATION_ERROR') {
      logTest('Validate Position Data', true, 'Correctly rejected invalid data');
      return true;
    } else {
      logTest('Validate Position Data', false, 'Wrong error response');
      return false;
    }
  }
}

// Test 8: Validate date range (should fail)
async function testValidateDateRange() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/positions`,
      {
        title: 'Test Position',
        description: 'Test',
        total_slots: 5,
        start_date: '2024-12-31',
        end_date: '2024-07-01' // End before start
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logTest('Validate Date Range', false, 'Should have rejected invalid date range');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'VALIDATION_ERROR') {
      logTest('Validate Date Range', true, 'Correctly rejected invalid date range');
      return true;
    } else {
      logTest('Validate Date Range', false, 'Wrong error response');
      return false;
    }
  }
}

// Test 9: Delete position
async function testDeletePosition() {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/positions/${positionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      logTest('Delete Position', true, 'Position deleted successfully');
      return true;
    } else {
      logTest('Delete Position', false, 'Delete failed');
      return false;
    }
  } catch (error) {
    logTest('Delete Position', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n=== Position API Tests ===\n');
  console.log('Note: Make sure the server is running on http://localhost:3000\n');

  const results = [];

  results.push(await testRegisterEnterprise());
  if (!results[0]) {
    console.log('\nStopping tests: Failed to register enterprise user');
    return;
  }

  results.push(await testCreatePosition());
  if (!results[1]) {
    console.log('\nStopping tests: Failed to create position');
    return;
  }

  results.push(await testGetPositions());
  results.push(await testGetPositionById());
  results.push(await testSearchPositions());
  results.push(await testUpdatePosition());
  results.push(await testValidatePositionData());
  results.push(await testValidateDateRange());
  results.push(await testDeletePosition());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n=== Test Summary ===`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);
}

// Check if server is accessible
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}`);
    return true;
  } catch (error) {
    console.error('Error: Cannot connect to server at', API_BASE_URL);
    console.error('Please make sure the server is running with: npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  const serverReady = await checkServer();
  if (serverReady) {
    await runTests();
  }
  process.exit(0);
})();
