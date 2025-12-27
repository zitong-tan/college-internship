/**
 * Test script to verify API data format
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
const credentials = {
  student: { username: 'student1', password: 'password123' },
  teacher: { username: 'teacher1', password: 'password123' },
  enterprise: { username: 'enterprise1', password: 'password123' }
};

async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error(`❌ Login failed for ${username}:`, error.response?.data || error.message);
    throw error;
  }
}

async function testApplicationsFormat(token, role) {
  try {
    console.log(`\n📋 Testing Applications API (${role})...`);
    const response = await axios.get(`${API_BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasApplications: !!response.data.data?.applications,
      hasTotal: !!response.data.data?.total,
      applicationsCount: response.data.data?.applications?.length || 0,
      total: response.data.data?.total
    });
    
    if (response.data.data?.applications?.length > 0) {
      console.log('📄 First application sample:', {
        id: response.data.data.applications[0].id,
        status: response.data.data.applications[0].status,
        hasStudent: !!response.data.data.applications[0].student,
        hasPosition: !!response.data.data.applications[0].position
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ Applications test failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testInternshipsFormat(token, role) {
  try {
    console.log(`\n📋 Testing Internships API (${role})...`);
    const response = await axios.get(`${API_BASE_URL}/internships`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasInternships: !!response.data.data?.internships,
      hasTotal: !!response.data.data?.total,
      internshipsCount: response.data.data?.internships?.length || 0,
      total: response.data.data?.total
    });
    
    if (response.data.data?.internships?.length > 0) {
      console.log('📄 First internship sample:', {
        id: response.data.data.internships[0].id,
        status: response.data.data.internships[0].status,
        hasStudent: !!response.data.data.internships[0].student,
        hasPosition: !!response.data.data.internships[0].position
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ Internships test failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function testPositionsFormat() {
  try {
    console.log(`\n📋 Testing Positions API (public)...`);
    const response = await axios.get(`${API_BASE_URL}/positions`);
    
    console.log('✅ Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasPositions: !!response.data.data?.positions,
      hasPagination: !!response.data.data?.pagination,
      positionsCount: response.data.data?.positions?.length || 0,
      total: response.data.data?.pagination?.total
    });
    
    if (response.data.data?.positions?.length > 0) {
      console.log('📄 First position sample:', {
        id: response.data.data.positions[0].id,
        title: response.data.data.positions[0].title,
        status: response.data.data.positions[0].status,
        hasEnterprise: !!response.data.data.positions[0].enterprise
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(`❌ Positions test failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting API Data Format Tests...\n');
  
  try {
    // Test positions (public endpoint)
    await testPositionsFormat();
    
    // Test student endpoints
    console.log('\n👨‍🎓 Testing Student Endpoints...');
    const studentToken = await login(credentials.student.username, credentials.student.password);
    await testApplicationsFormat(studentToken, 'student');
    await testInternshipsFormat(studentToken, 'student');
    
    // Test teacher endpoints
    console.log('\n👨‍🏫 Testing Teacher Endpoints...');
    const teacherToken = await login(credentials.teacher.username, credentials.teacher.password);
    await testApplicationsFormat(teacherToken, 'teacher');
    await testInternshipsFormat(teacherToken, 'teacher');
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
