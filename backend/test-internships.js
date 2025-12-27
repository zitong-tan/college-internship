/**
 * Test script for internship management endpoints
 * Tests logs, files, progress, and status updates
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials (you'll need to update these with actual test data)
let studentToken = '';
let teacherToken = '';
let internshipId = null;

async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetInternships(token, role) {
  console.log(`\n=== Testing Get Internships (${role}) ===`);
  try {
    const response = await axios.get(`${API_BASE_URL}/internships`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Get internships successful');
    console.log(`Found ${response.data.data.length} internships`);
    if (response.data.data.length > 0) {
      internshipId = response.data.data[0].id;
      console.log(`Using internship ID: ${internshipId}`);
    }
    return response.data.data;
  } catch (error) {
    console.error('✗ Get internships failed:', error.response?.data || error.message);
  }
}

async function testGetInternshipDetails(token, id) {
  console.log('\n=== Testing Get Internship Details ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/internships/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Get internship details successful');
    console.log('Progress:', response.data.data.progress);
    console.log('Status:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    console.error('✗ Get internship details failed:', error.response?.data || error.message);
  }
}

async function testSubmitLog(token, internshipId) {
  console.log('\n=== Testing Submit Internship Log ===');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/logs`,
      {
        content: '今天完成了项目的需求分析，与导师讨论了技术方案。',
        log_date: new Date().toISOString().split('T')[0]
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ Submit log successful');
    console.log('Log ID:', response.data.data.id);
    return response.data.data;
  } catch (error) {
    console.error('✗ Submit log failed:', error.response?.data || error.message);
  }
}

async function testGetLogs(token, internshipId) {
  console.log('\n=== Testing Get Internship Logs ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/internships/${internshipId}/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Get logs successful');
    console.log(`Found ${response.data.data.length} logs`);
    return response.data.data;
  } catch (error) {
    console.error('✗ Get logs failed:', error.response?.data || error.message);
  }
}

async function testGetProgress(token, internshipId) {
  console.log('\n=== Testing Get Internship Progress ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/internships/${internshipId}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Get progress successful');
    console.log('Progress:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('✗ Get progress failed:', error.response?.data || error.message);
  }
}

async function testUpdateExpiredStatus(token) {
  console.log('\n=== Testing Update Expired Status ===');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/internships/update-expired`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ Update expired status successful');
    console.log('Result:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('✗ Update expired status failed:', error.response?.data || error.message);
  }
}

async function testTeacherAccess(token, internshipId) {
  console.log('\n=== Testing Teacher Access to Student Data ===');
  
  // Test getting logs
  await testGetLogs(token, internshipId);
  
  // Test getting files
  console.log('\n--- Testing Get Files (Teacher) ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/internships/${internshipId}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Teacher can access files');
    console.log(`Found ${response.data.data.length} files`);
  } catch (error) {
    console.error('✗ Teacher access to files failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('=== Internship Management API Tests ===\n');
  
  try {
    // Login as student
    console.log('Logging in as student...');
    studentToken = await login('student1', 'password123');
    console.log('✓ Student login successful');

    // Login as teacher
    console.log('\nLogging in as teacher...');
    teacherToken = await login('teacher1', 'password123');
    console.log('✓ Teacher login successful');

    // Test student operations
    const internships = await testGetInternships(studentToken, 'student');
    
    if (internshipId) {
      await testGetInternshipDetails(studentToken, internshipId);
      await testSubmitLog(studentToken, internshipId);
      await testGetLogs(studentToken, internshipId);
      await testGetProgress(studentToken, internshipId);
      
      // Test teacher access
      await testTeacherAccess(teacherToken, internshipId);
      
      // Test status update (teacher only)
      await testUpdateExpiredStatus(teacherToken);
    } else {
      console.log('\n⚠ No internships found. Please create test data first.');
    }

    console.log('\n=== All Tests Completed ===');
  } catch (error) {
    console.error('\n=== Test Suite Failed ===');
    console.error(error.message);
  }
}

// Run tests
runTests();
