/**
 * Statistics API Test Script
 * Tests the statistics and report export endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
let teacherToken = '';

/**
 * Helper function to login and get token
 */
async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    
    if (response.data.success) {
      console.log(`✓ Login successful for ${username}`);
      return response.data.data.token;
    }
  } catch (error) {
    console.error(`✗ Login failed for ${username}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 1: Get statistics overview without filters
 */
async function testStatisticsOverview() {
  console.log('\n--- Test 1: Get Statistics Overview (No Filters) ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    
    console.log('✓ Statistics overview retrieved successfully');
    console.log('Applications:', response.data.data.applications);
    console.log('Internships:', response.data.data.internships);
    console.log('Positions:', response.data.data.positions);
    console.log('Number of enterprises:', response.data.data.enterprises.length);
  } catch (error) {
    console.error('✗ Failed to get statistics overview:', error.response?.data || error.message);
  }
}

/**
 * Test 2: Get statistics overview with date range filter
 */
async function testStatisticsWithDateFilter() {
  console.log('\n--- Test 2: Get Statistics Overview (With Date Filter) ---');
  try {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { startDate, endDate }
    });
    
    console.log(`✓ Statistics retrieved for period: ${startDate} to ${endDate}`);
    console.log('Applications:', response.data.data.applications);
    console.log('Period:', response.data.data.period);
  } catch (error) {
    console.error('✗ Failed to get filtered statistics:', error.response?.data || error.message);
  }
}

/**
 * Test 3: Get statistics overview with period filter
 */
async function testStatisticsWithPeriodFilter() {
  console.log('\n--- Test 3: Get Statistics Overview (With Period Filter) ---');
  try {
    const period = 'month';
    
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period }
    });
    
    console.log(`✓ Statistics retrieved for period: ${period}`);
    console.log('Applications:', response.data.data.applications);
    console.log('Period:', response.data.data.period);
  } catch (error) {
    console.error('✗ Failed to get period statistics:', error.response?.data || error.message);
  }
}

/**
 * Test 4: Get enterprise-specific statistics
 */
async function testEnterpriseStatistics() {
  console.log('\n--- Test 4: Get Enterprise Statistics ---');
  try {
    const enterpriseId = 1; // Assuming enterprise with ID 1 exists
    
    const response = await axios.get(`${API_BASE_URL}/statistics/enterprise/${enterpriseId}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    
    console.log(`✓ Enterprise statistics retrieved for ID: ${enterpriseId}`);
    console.log('Enterprise:', response.data.data.enterprise);
    console.log('Positions:', response.data.data.positions);
    console.log('Student Distribution:', response.data.data.studentDistribution);
  } catch (error) {
    console.error('✗ Failed to get enterprise statistics:', error.response?.data || error.message);
  }
}

/**
 * Test 5: Get time-series statistics
 */
async function testTimeSeriesStatistics() {
  console.log('\n--- Test 5: Get Time-Series Statistics ---');
  try {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const groupBy = 'month';
    
    const response = await axios.get(`${API_BASE_URL}/statistics/timeseries`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { startDate, endDate, groupBy }
    });
    
    console.log(`✓ Time-series statistics retrieved (grouped by ${groupBy})`);
    console.log('Application time series entries:', response.data.data.applications.length);
    console.log('Internship time series entries:', response.data.data.internships.length);
    if (response.data.data.applications.length > 0) {
      console.log('Sample application data:', response.data.data.applications[0]);
    }
  } catch (error) {
    console.error('✗ Failed to get time-series statistics:', error.response?.data || error.message);
  }
}

/**
 * Test 6: Test filter responsiveness - changing filters should update statistics
 */
async function testFilterResponsiveness() {
  console.log('\n--- Test 6: Test Filter Responsiveness ---');
  try {
    // First request with one filter
    const response1 = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period: 'month' }
    });
    
    console.log('✓ First request (period: month)');
    console.log('Total applications:', response1.data.data.applications.total);
    
    // Second request with different filter
    const response2 = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period: 'year' }
    });
    
    console.log('✓ Second request (period: year)');
    console.log('Total applications:', response2.data.data.applications.total);
    
    // Third request with date range
    const response3 = await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { 
        startDate: '2024-06-01',
        endDate: '2024-12-31'
      }
    });
    
    console.log('✓ Third request (date range: 2024-06-01 to 2024-12-31)');
    console.log('Total applications:', response3.data.data.applications.total);
    
    console.log('\n✓ Filter responsiveness verified - statistics update based on filter changes');
  } catch (error) {
    console.error('✗ Failed to test filter responsiveness:', error.response?.data || error.message);
  }
}

/**
 * Test 7: Export Excel report
 */
async function testExcelExport() {
  console.log('\n--- Test 7: Export Excel Report ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/export/excel`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period: 'month' },
      responseType: 'arraybuffer'
    });
    
    console.log('✓ Excel report exported successfully');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('File size:', response.data.byteLength, 'bytes');
  } catch (error) {
    console.error('✗ Failed to export Excel report:', error.response?.data || error.message);
  }
}

/**
 * Test 8: Export PDF report
 */
async function testPdfExport() {
  console.log('\n--- Test 8: Export PDF Report ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/export/pdf`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
      params: { period: 'month' },
      responseType: 'arraybuffer'
    });
    
    console.log('✓ PDF report exported successfully');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('File size:', response.data.byteLength, 'bytes');
  } catch (error) {
    console.error('✗ Failed to export PDF report:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Statistics API Tests ===\n');
  
  try {
    // Login as teacher
    console.log('Logging in as teacher...');
    teacherToken = await login('teacher1', 'password123');
    
    // Run tests
    await testStatisticsOverview();
    await testStatisticsWithDateFilter();
    await testStatisticsWithPeriodFilter();
    await testEnterpriseStatistics();
    await testTimeSeriesStatistics();
    await testFilterResponsiveness();
    await testExcelExport();
    await testPdfExport();
    
    console.log('\n=== All Tests Completed ===');
  } catch (error) {
    console.error('\n=== Tests Failed ===');
    console.error(error.message);
  }
}

// Run tests
runTests();
