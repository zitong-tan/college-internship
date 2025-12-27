const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPositionsAPI() {
  console.log('Testing Positions API...\n');
  
  try {
    // Test 1: Get all positions
    console.log('1. Testing GET /api/positions');
    const response = await axios.get(`${API_BASE_URL}/positions`, {
      params: {
        page: 1,
        limit: 10
      }
    });
    
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('Total positions:', response.data.data.pagination.total);
    console.log('Positions count:', response.data.data.positions.length);
    
    if (response.data.data.positions.length > 0) {
      const firstPosition = response.data.data.positions[0];
      console.log('\nFirst position structure:');
      console.log('- ID:', firstPosition.id);
      console.log('- Title:', firstPosition.title);
      console.log('- Enterprise ID:', firstPosition.enterprise_id);
      console.log('- Enterprise object:', firstPosition.enterprise ? 'Present' : 'Missing');
      if (firstPosition.enterprise) {
        console.log('  - Company name:', firstPosition.enterprise.company_name);
        console.log('  - Industry:', firstPosition.enterprise.industry);
      }
      console.log('- Status:', firstPosition.status);
      console.log('- Available slots:', firstPosition.available_slots);
      console.log('- Total slots:', firstPosition.total_slots);
      
      // Test 2: Get single position
      console.log(`\n2. Testing GET /api/positions/${firstPosition.id}`);
      const detailResponse = await axios.get(`${API_BASE_URL}/positions/${firstPosition.id}`);
      console.log('Status:', detailResponse.status);
      console.log('Success:', detailResponse.data.success);
      console.log('Position title:', detailResponse.data.data.title);
      console.log('Enterprise:', detailResponse.data.data.enterprise?.company_name);
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPositionsAPI();
