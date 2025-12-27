/**
 * Test script for Notification API endpoints
 * Tests notification query, management, and reminder functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test user tokens (will be set after login)
let studentToken = '';
let teacherToken = '';
let enterpriseToken = '';

// Test data IDs
let testNotificationId = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
}

/**
 * Test 1: Login users
 */
async function testLogin() {
  console.log('\n=== Test 1: Login Users ===');

  // Login as student
  const studentLogin = await apiRequest('POST', '/auth/login', {
    username: 'student1',
    password: 'password123'
  });

  if (studentLogin.success) {
    studentToken = studentLogin.data.data.token;
    console.log('✓ Student login successful');
  } else {
    console.log('✗ Student login failed:', studentLogin.error);
  }

  // Login as teacher
  const teacherLogin = await apiRequest('POST', '/auth/login', {
    username: 'teacher1',
    password: 'password123'
  });

  if (teacherLogin.success) {
    teacherToken = teacherLogin.data.data.token;
    console.log('✓ Teacher login successful');
  } else {
    console.log('✗ Teacher login failed:', teacherLogin.error);
  }

  // Login as enterprise
  const enterpriseLogin = await apiRequest('POST', '/auth/login', {
    username: 'enterprise1',
    password: 'password123'
  });

  if (enterpriseLogin.success) {
    enterpriseToken = enterpriseLogin.data.data.token;
    console.log('✓ Enterprise login successful');
  } else {
    console.log('✗ Enterprise login failed:', enterpriseLogin.error);
  }
}

/**
 * Test 2: Get notification list
 */
async function testGetNotifications() {
  console.log('\n=== Test 2: Get Notification List ===');

  // Get all notifications for student
  const result = await apiRequest('GET', '/notifications', null, studentToken);

  if (result.success) {
    console.log('✓ Get notifications successful');
    console.log(`  Total notifications: ${result.data.data.notifications.length}`);
    console.log(`  Unread count: ${result.data.data.unread_count}`);
    
    if (result.data.data.notifications.length > 0) {
      testNotificationId = result.data.data.notifications[0].id;
      console.log(`  First notification: ${result.data.data.notifications[0].title}`);
    }
  } else {
    console.log('✗ Get notifications failed:', result.error);
  }
}

/**
 * Test 3: Get unread notification count
 */
async function testGetUnreadCount() {
  console.log('\n=== Test 3: Get Unread Count ===');

  const result = await apiRequest('GET', '/notifications/unread-count', null, studentToken);

  if (result.success) {
    console.log('✓ Get unread count successful');
    console.log(`  Unread count: ${result.data.data.unread_count}`);
  } else {
    console.log('✗ Get unread count failed:', result.error);
  }
}

/**
 * Test 4: Mark notification as read
 */
async function testMarkAsRead() {
  console.log('\n=== Test 4: Mark Notification as Read ===');

  if (!testNotificationId) {
    console.log('⊘ Skipping - no notification available');
    return;
  }

  const result = await apiRequest('PUT', `/notifications/${testNotificationId}/read`, null, studentToken);

  if (result.success) {
    console.log('✓ Mark as read successful');
    console.log(`  Notification is_read: ${result.data.data.is_read}`);
  } else {
    console.log('✗ Mark as read failed:', result.error);
  }
}

/**
 * Test 5: Get filtered notifications (only unread)
 */
async function testGetUnreadNotifications() {
  console.log('\n=== Test 5: Get Unread Notifications ===');

  const result = await apiRequest('GET', '/notifications?is_read=false', null, studentToken);

  if (result.success) {
    console.log('✓ Get unread notifications successful');
    console.log(`  Unread notifications: ${result.data.data.notifications.length}`);
  } else {
    console.log('✗ Get unread notifications failed:', result.error);
  }
}

/**
 * Test 6: Mark all notifications as read
 */
async function testMarkAllAsRead() {
  console.log('\n=== Test 6: Mark All Notifications as Read ===');

  const result = await apiRequest('PUT', '/notifications/read-all', null, studentToken);

  if (result.success) {
    console.log('✓ Mark all as read successful');
    console.log(`  Updated count: ${result.data.data.updated_count}`);
  } else {
    console.log('✗ Mark all as read failed:', result.error);
  }
}

/**
 * Test 7: Send expiring internship reminders (teacher only)
 */
async function testSendReminders() {
  console.log('\n=== Test 7: Send Expiring Internship Reminders ===');

  const result = await apiRequest('POST', '/notifications/send-reminders', null, teacherToken);

  if (result.success) {
    console.log('✓ Send reminders successful');
    console.log(`  Internships checked: ${result.data.data.internships_checked}`);
    console.log(`  Notifications sent: ${result.data.data.notifications_sent}`);
  } else {
    console.log('✗ Send reminders failed:', result.error);
  }
}

/**
 * Test 8: Update expired internships (teacher only)
 */
async function testUpdateExpired() {
  console.log('\n=== Test 8: Update Expired Internships ===');

  const result = await apiRequest('POST', '/notifications/update-expired', null, teacherToken);

  if (result.success) {
    console.log('✓ Update expired successful');
    console.log(`  Updated internships: ${result.data.data.updated}`);
  } else {
    console.log('✗ Update expired failed:', result.error);
  }
}

/**
 * Test 9: Test authorization - student cannot trigger reminders
 */
async function testAuthorizationCheck() {
  console.log('\n=== Test 9: Authorization Check ===');

  const result = await apiRequest('POST', '/notifications/send-reminders', null, studentToken);

  if (!result.success && result.error.error.code === 'FORBIDDEN') {
    console.log('✓ Authorization check passed - student cannot trigger reminders');
  } else {
    console.log('✗ Authorization check failed - student should not be able to trigger reminders');
  }
}

/**
 * Test 10: Get notifications with pagination
 */
async function testPagination() {
  console.log('\n=== Test 10: Pagination ===');

  const result = await apiRequest('GET', '/notifications?limit=5&offset=0', null, studentToken);

  if (result.success) {
    console.log('✓ Pagination successful');
    console.log(`  Returned: ${result.data.data.notifications.length} notifications`);
    console.log(`  Total: ${result.data.data.pagination.total}`);
  } else {
    console.log('✗ Pagination failed:', result.error);
  }
}

/**
 * Test 11: Get notifications by type
 */
async function testFilterByType() {
  console.log('\n=== Test 11: Filter by Type ===');

  const result = await apiRequest('GET', '/notifications?type=application_submitted', null, teacherToken);

  if (result.success) {
    console.log('✓ Filter by type successful');
    console.log(`  Notifications of type "application_submitted": ${result.data.data.notifications.length}`);
  } else {
    console.log('✗ Filter by type failed:', result.error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting Notification API Tests...');
  console.log('=====================================');

  await testLogin();
  
  if (!studentToken || !teacherToken) {
    console.log('\n✗ Cannot proceed without valid tokens');
    return;
  }

  await testGetNotifications();
  await testGetUnreadCount();
  await testMarkAsRead();
  await testGetUnreadNotifications();
  await testMarkAllAsRead();
  await testSendReminders();
  await testUpdateExpired();
  await testAuthorizationCheck();
  await testPagination();
  await testFilterByType();

  console.log('\n=====================================');
  console.log('Notification API Tests Completed');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
