/**
 * Test script for internship evaluation endpoints
 * Tests teacher evaluation, enterprise evaluation, final score calculation, and student viewing
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
let studentToken = '';
let teacherToken = '';
let enterpriseToken = '';
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

async function findInternship(token) {
  console.log('\n=== Finding Internship for Testing ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/internships`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.data.length > 0) {
      // Find an internship in pending_evaluation or completed status
      const internship = response.data.data.find(i => 
        i.status === 'pending_evaluation' || i.status === 'completed'
      );
      
      if (internship) {
        internshipId = internship.id;
        console.log(`✓ Found internship ID: ${internshipId}`);
        console.log(`  Status: ${internship.status}`);
        console.log(`  Teacher Score: ${internship.teacher_score || 'Not yet evaluated'}`);
        console.log(`  Enterprise Score: ${internship.enterprise_score || 'Not yet evaluated'}`);
        return internship;
      } else {
        console.log('⚠ No internships in pending_evaluation or completed status found');
        // Use the first internship anyway for testing
        internshipId = response.data.data[0].id;
        console.log(`Using internship ID: ${internshipId} (Status: ${response.data.data[0].status})`);
        return response.data.data[0];
      }
    } else {
      console.log('⚠ No internships found');
      return null;
    }
  } catch (error) {
    console.error('✗ Find internship failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSubmitTeacherEvaluation(token, internshipId, score, comment) {
  console.log('\n=== Testing Submit Teacher Evaluation ===');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/teacher`,
      {
        score: score,
        comment: comment
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ Teacher evaluation submitted successfully');
    console.log('  Teacher Score:', response.data.data.teacher_score);
    console.log('  Teacher Comment:', response.data.data.teacher_comment);
    console.log('  Final Score:', response.data.data.final_score || 'Not yet calculated');
    console.log('  Status:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    console.error('✗ Submit teacher evaluation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testSubmitEnterpriseEvaluation(token, internshipId, score, comment) {
  console.log('\n=== Testing Submit Enterprise Evaluation ===');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/enterprise`,
      {
        score: score,
        comment: comment
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ Enterprise evaluation submitted successfully');
    console.log('  Enterprise Score:', response.data.data.enterprise_score);
    console.log('  Enterprise Comment:', response.data.data.enterprise_comment);
    console.log('  Final Score:', response.data.data.final_score || 'Not yet calculated');
    console.log('  Status:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    console.error('✗ Submit enterprise evaluation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetEvaluation(token, internshipId) {
  console.log('\n=== Testing Get Evaluation (Student View) ===');
  try {
    const response = await axios.get(
      `${API_BASE_URL}/internships/${internshipId}/evaluation`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✓ Get evaluation successful');
    console.log('  Teacher Score:', response.data.data.teacher_score || 'Not yet evaluated');
    console.log('  Teacher Comment:', response.data.data.teacher_comment || 'No comment');
    console.log('  Enterprise Score:', response.data.data.enterprise_score || 'Not yet evaluated');
    console.log('  Enterprise Comment:', response.data.data.enterprise_comment || 'No comment');
    console.log('  Final Score:', response.data.data.final_score || 'Not yet calculated');
    console.log('  Status:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    console.error('✗ Get evaluation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testInvalidScoreValidation(token, internshipId) {
  console.log('\n=== Testing Score Validation ===');
  
  // Test score > 100
  console.log('\n--- Testing score > 100 ---');
  try {
    await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/teacher`,
      {
        score: 150,
        comment: 'Test'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✗ Should have rejected score > 100');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Correctly rejected score > 100');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test score < 0
  console.log('\n--- Testing score < 0 ---');
  try {
    await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/teacher`,
      {
        score: -10,
        comment: 'Test'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✗ Should have rejected score < 0');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Correctly rejected score < 0');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test missing score
  console.log('\n--- Testing missing score ---');
  try {
    await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/teacher`,
      {
        comment: 'Test'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✗ Should have rejected missing score');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Correctly rejected missing score');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testFinalScoreCalculation(teacherToken, enterpriseToken, studentToken, internshipId) {
  console.log('\n=== Testing Final Score Calculation ===');
  
  const teacherScore = 85.0;
  const enterpriseScore = 90.0;
  const expectedFinalScore = (teacherScore * 0.5 + enterpriseScore * 0.5);
  
  console.log(`\nExpected calculation: (${teacherScore} * 0.5 + ${enterpriseScore} * 0.5) = ${expectedFinalScore}`);
  
  // Submit teacher evaluation
  await testSubmitTeacherEvaluation(teacherToken, internshipId, teacherScore, '学生表现优秀，积极主动');
  
  // Submit enterprise evaluation
  const result = await testSubmitEnterpriseEvaluation(enterpriseToken, internshipId, enterpriseScore, '工作认真负责，技术能力强');
  
  // Verify final score
  if (result.final_score) {
    const actualFinalScore = parseFloat(result.final_score);
    if (Math.abs(actualFinalScore - expectedFinalScore) < 0.01) {
      console.log(`\n✓ Final score calculation correct: ${actualFinalScore}`);
    } else {
      console.log(`\n✗ Final score calculation incorrect: Expected ${expectedFinalScore}, got ${actualFinalScore}`);
    }
  } else {
    console.log('\n✗ Final score not calculated');
  }
  
  // Verify status update to completed
  if (result.status === 'completed') {
    console.log('✓ Status correctly updated to "completed"');
  } else {
    console.log(`✗ Status not updated to "completed", current status: ${result.status}`);
  }
  
  // Verify student can view evaluation
  await testGetEvaluation(studentToken, internshipId);
}

async function testPermissions(studentToken, teacherToken, enterpriseToken, internshipId) {
  console.log('\n=== Testing Permission Controls ===');
  
  // Test student cannot submit teacher evaluation
  console.log('\n--- Testing student cannot submit teacher evaluation ---');
  try {
    await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/teacher`,
      {
        score: 80,
        comment: 'Test'
      },
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    console.log('✗ Student should not be able to submit teacher evaluation');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✓ Correctly blocked student from submitting teacher evaluation');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test teacher cannot submit enterprise evaluation
  console.log('\n--- Testing teacher cannot submit enterprise evaluation ---');
  try {
    await axios.post(
      `${API_BASE_URL}/internships/${internshipId}/evaluate/enterprise`,
      {
        score: 80,
        comment: 'Test'
      },
      {
        headers: { Authorization: `Bearer ${teacherToken}` }
      }
    );
    console.log('✗ Teacher should not be able to submit enterprise evaluation');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✓ Correctly blocked teacher from submitting enterprise evaluation');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function runTests() {
  console.log('=== Internship Evaluation API Tests ===\n');
  
  try {
    // Login as different users
    console.log('Logging in as student...');
    studentToken = await login('student1', 'password123');
    console.log('✓ Student login successful');

    console.log('\nLogging in as teacher...');
    teacherToken = await login('teacher1', 'password123');
    console.log('✓ Teacher login successful');

    console.log('\nLogging in as enterprise...');
    enterpriseToken = await login('enterprise1', 'password123');
    console.log('✓ Enterprise login successful');

    // Find an internship to test with
    const internship = await findInternship(studentToken);
    
    if (!internshipId) {
      console.log('\n⚠ No internships found. Please create test data first.');
      console.log('You need:');
      console.log('  1. A student user (student1)');
      console.log('  2. A teacher user (teacher1)');
      console.log('  3. An enterprise user (enterprise1)');
      console.log('  4. An internship record in pending_evaluation status');
      return;
    }

    // Test validation
    await testInvalidScoreValidation(teacherToken, internshipId);
    
    // Test permissions
    await testPermissions(studentToken, teacherToken, enterpriseToken, internshipId);
    
    // Test full evaluation flow with score calculation
    await testFinalScoreCalculation(teacherToken, enterpriseToken, studentToken, internshipId);

    console.log('\n=== All Evaluation Tests Completed ===');
  } catch (error) {
    console.error('\n=== Test Suite Failed ===');
    console.error(error.message);
  }
}

// Run tests
runTests();
