/**
 * Simple test script to verify authentication system
 * Run with: node test-auth.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  username: 'testuser123',
  password: 'password123',
  role: 'student',
  email: 'testuser@example.com',
  real_name: 'Test User',
  student_number: 'S2024001',
  major: 'Computer Science',
  grade: 2024,
  class_name: 'CS-1'
};

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication System\n');

    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful');
      console.log('   User ID:', registerResponse.data.data.id);
      console.log('   Username:', registerResponse.data.data.username);
      console.log('   Role:', registerResponse.data.data.role);
    } catch (error) {
      if (error.response?.data?.error?.code === 'DUPLICATE_USER') {
        console.log('⚠️  User already exists, continuing with login test...');
      } else {
        throw error;
      }
    }

    // Test 2: Login with valid credentials
    console.log('\n2️⃣ Testing login with valid credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login successful');
    console.log('   Token received:', loginResponse.data.data.token.substring(0, 20) + '...');
    const token = loginResponse.data.data.token;

    // Test 3: Login with invalid credentials
    console.log('\n3️⃣ Testing login with invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        username: testUser.username,
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid credentials');
      } else {
        throw error;
      }
    }

    // Test 4: Access protected route with valid token
    console.log('\n4️⃣ Testing access to protected route with valid token...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Successfully accessed protected route');
    console.log('   Profile:', profileResponse.data.data.username);

    // Test 5: Access protected route without token
    console.log('\n5️⃣ Testing access to protected route without token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
      } else {
        throw error;
      }
    }

    // Test 6: Access protected route with invalid token
    console.log('\n6️⃣ Testing access to protected route with invalid token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: 'Bearer invalid_token_here'
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        throw error;
      }
    }

    console.log('\n✨ All authentication tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running. Please start the server first with: npm run dev');
    process.exit(1);
  }

  await testAuth();
}

main();
