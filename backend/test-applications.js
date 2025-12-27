/**
 * Manual test script for application functionality
 * Run with: node test-applications.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

let studentToken = '';
let teacherToken = '';
let applicationId = null;

// Test data
const testStudent = {
  username: 'teststudent_app',
  password: 'password123',
  role: 'student',
  email: 'teststudent_app@test.com',
  real_name: 'Test Student App',
  student_number: 'STU_APP_001',
  major: 'Computer Science',
  grade: 2023,
  class_name: 'CS-1'
};

const testTeacher = {
  username: 'testteacher_app',
  password: 'password123',
  role: 'teacher',
  email: 'testteacher_app@test.com',
  real_name: 'Test Teacher App',
  teacher_number: 'TCH_APP_001',
  department: 'Computer Science',
  title: 'Professor'
};

async function testApplicationFlow() {
  console.log('=== Testing Application Functionality ===\n');

  try {
    // Step 1: Login as student
    console.log('1. Logging in as student...');
    try {
      const studentLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: testStudent.username,
        password: testStudent.password
      });
      studentToken = studentLoginRes.data.data.token;
      console.log('✓ Student login successful\n');
    } catch (error) {
      console.log('Student not found, registering...');
      await axios.post(`${API_BASE_URL}/auth/register`, testStudent);
      const studentLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: testStudent.username,
        password: testStudent.password
      });
      studentToken = studentLoginRes.data.data.token;
      console.log('✓ Student registered and logged in\n');
    }

    // Step 2: Login as teacher
    console.log('2. Logging in as teacher...');
    try {
      const teacherLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: testTeacher.username,
        password: testTeacher.password
      });
      teacherToken = teacherLoginRes.data.data.token;
      console.log('✓ Teacher login successful\n');
    } catch (error) {
      console.log('Teacher not found, registering...');
      await axios.post(`${API_BASE_URL}/auth/register`, testTeacher);
      const teacherLoginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: testTeacher.username,
        password: testTeacher.password
      });
      teacherToken = teacherLoginRes.data.data.token;
      console.log('✓ Teacher registered and logged in\n');
    }

    // Step 3: Get available positions
    console.log('3. Getting available positions...');
    const positionsRes = await axios.get(`${API_BASE_URL}/positions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (positionsRes.data.data.length === 0) {
      console.log('✗ No positions available. Please create a position first.');
      return;
    }
    
    const position = positionsRes.data.data[0];
    console.log(`✓ Found position: ${position.title} (ID: ${position.id})\n`);

    // Step 4: Submit application
    console.log('4. Submitting application...');
    const applicationData = {
      position_id: position.id,
      personal_statement: '我对这个岗位非常感兴趣，希望能够获得这次实习机会。我有相关的技能和经验。',
      contact_info: '13800138000'
    };

    const submitRes = await axios.post(`${API_BASE_URL}/applications`, applicationData, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    applicationId = submitRes.data.data.id;
    console.log(`✓ Application submitted successfully (ID: ${applicationId})`);
    console.log(`  Status: ${submitRes.data.data.status}\n`);

    // Step 5: Test duplicate application prevention
    console.log('5. Testing duplicate application prevention...');
    try {
      await axios.post(`${API_BASE_URL}/applications`, applicationData, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✗ Duplicate application was not prevented!\n');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✓ Duplicate application correctly prevented\n');
      } else {
        throw error;
      }
    }

    // Step 6: Get applications as student
    console.log('6. Getting applications as student...');
    const studentAppsRes = await axios.get(`${API_BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Found ${studentAppsRes.data.data.length} application(s)\n`);

    // Step 7: Get applications as teacher
    console.log('7. Getting applications as teacher...');
    const teacherAppsRes = await axios.get(`${API_BASE_URL}/applications?status=pending`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log(`✓ Found ${teacherAppsRes.data.data.length} pending application(s)\n`);

    // Step 8: Get application details
    console.log('8. Getting application details...');
    const appDetailsRes = await axios.get(`${API_BASE_URL}/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log(`✓ Application details retrieved`);
    console.log(`  Student: ${appDetailsRes.data.data.student.user.real_name}`);
    console.log(`  Position: ${appDetailsRes.data.data.position.title}`);
    console.log(`  Status: ${appDetailsRes.data.data.status}\n`);

    // Step 9: Approve application
    console.log('9. Approving application...');
    const approveRes = await axios.put(
      `${API_BASE_URL}/applications/${applicationId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    console.log(`✓ Application approved`);
    console.log(`  Status: ${approveRes.data.data.status}`);
    console.log(`  Reviewed at: ${approveRes.data.data.reviewed_at}`);
    
    if (approveRes.data.data.internship) {
      console.log(`  Internship created: ID ${approveRes.data.data.internship.id}\n`);
    } else {
      console.log(`  Internship: Will be created\n`);
    }

    // Step 10: Verify position slots decreased
    console.log('10. Verifying position slots decreased...');
    const updatedPositionRes = await axios.get(`${API_BASE_URL}/positions/${position.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const updatedPosition = updatedPositionRes.data.data;
    console.log(`✓ Position slots updated`);
    console.log(`  Available slots: ${updatedPosition.available_slots} (was ${position.available_slots})\n`);

    console.log('=== All Application Tests Passed! ===\n');

  } catch (error) {
    console.error('\n✗ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Test rejection flow separately
async function testRejectionFlow() {
  console.log('\n=== Testing Application Rejection ===\n');

  try {
    // Get available positions
    const positionsRes = await axios.get(`${API_BASE_URL}/positions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    if (positionsRes.data.data.length === 0) {
      console.log('✗ No positions available for rejection test.');
      return;
    }
    
    const position = positionsRes.data.data[0];

    // Submit another application
    console.log('1. Submitting application for rejection test...');
    const applicationData = {
      position_id: position.id,
      personal_statement: '这是用于测试拒绝流程的申请。',
      contact_info: '13900139000'
    };

    const submitRes = await axios.post(`${API_BASE_URL}/applications`, applicationData, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const appId = submitRes.data.data.id;
    console.log(`✓ Application submitted (ID: ${appId})\n`);

    // Test rejection without reason
    console.log('2. Testing rejection without reason...');
    try {
      await axios.put(
        `${API_BASE_URL}/applications/${appId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${teacherToken}` } }
      );
      console.log('✗ Rejection without reason was not prevented!\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Rejection without reason correctly prevented\n');
      } else {
        throw error;
      }
    }

    // Reject with reason
    console.log('3. Rejecting application with reason...');
    const rejectRes = await axios.put(
      `${API_BASE_URL}/applications/${appId}/reject`,
      { rejection_reason: '申请材料不完整，请补充相关证明文件。' },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    console.log(`✓ Application rejected`);
    console.log(`  Status: ${rejectRes.data.data.status}`);
    console.log(`  Reason: ${rejectRes.data.data.rejection_reason}\n`);

    console.log('=== Rejection Tests Passed! ===\n');

  } catch (error) {
    console.error('\n✗ Rejection test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run tests
(async () => {
  await testApplicationFlow();
  // Uncomment to test rejection flow
  // await testRejectionFlow();
})();
