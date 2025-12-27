/**
 * Test Statistics API Fix
 * Verify that statistics endpoint returns correct data structure
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
const TEACHER_CREDENTIALS = {
  username: 'teacher1',
  password: 'password123'
};

let teacherToken = '';

async function login() {
  try {
    console.log('Logging in as teacher...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, TEACHER_CREDENTIALS);
    teacherToken = response.data.data.token;
    console.log('✓ Login successful\n');
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testStatisticsOverview() {
  try {
    console.log('Testing statistics overview endpoint...');
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period: 'semester' }
    });
    
    const data = response.data.data;
    console.log('Response data structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verify expected fields
    const expectedFields = [
      'totalApplications',
      'approvedApplications',
      'rejectedApplications',
      'pendingApplications',
      'totalStudents',
      'totalEnterprises',
      'totalPositions',
      'monthlyTrend',
      'enterpriseDetails'
    ];
    
    const missingFields = expectedFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error('✗ Missing fields:', missingFields);
      return false;
    }
    
    console.log('✓ Statistics overview test passed');
    console.log(`  - Total Applications: ${data.totalApplications}`);
    console.log(`  - Total Students: ${data.totalStudents}`);
    console.log(`  - Total Enterprises: ${data.totalEnterprises}`);
    console.log(`  - Monthly Trend Records: ${data.monthlyTrend?.length || 0}`);
    console.log(`  - Enterprise Details: ${data.enterpriseDetails?.length || 0}\n`);
    return true;
  } catch (error) {
    console.error('✗ Statistics overview test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== Statistics API Fix Test ===\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n=== Test Failed: Could not login ===');
    return;
  }
  
  const overviewSuccess = await testStatisticsOverview();
  
  console.log('\n=== Test Summary ===');
  console.log(`Statistics Overview: ${overviewSuccess ? '✓ PASSED' : '✗ FAILED'}`);
  
  if (overviewSuccess) {
    console.log('\n✓ All tests passed! Statistics API is working correctly.');
  } else {
    console.log('\n✗ Some tests failed. Please check the errors above.');
  }
}

runTests();
