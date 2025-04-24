// scripts/test-api.js
// A simple script to test the API endpoints

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'puxxcanada@gmail.com';
const ADMIN_PASSWORD = 'Ilovemoney1!';

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Helper functions
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function testEndpoint(name, url, options = {}, expectedStatus = 200, validateResponse = null) {
  console.log(`Testing ${name}...`);
  
  try {
    const response = await fetchWithTimeout(`${BASE_URL}${url}`, options);
    const status = response.status;
    let data = null;
    
    try {
      data = await response.json();
    } catch (e) {
      // Not JSON or empty response
    }
    
    const statusPassed = status === expectedStatus;
    let validationPassed = true;
    let validationError = null;
    
    if (statusPassed && validateResponse && data) {
      try {
        validationPassed = validateResponse(data);
      } catch (error) {
        validationPassed = false;
        validationError = error.message;
      }
    }
    
    const passed = statusPassed && validationPassed;
    
    results.tests.push({
      name,
      url,
      passed,
      status,
      expectedStatus,
      validationPassed,
      validationError,
      data: passed ? null : data // Only include data if test failed
    });
    
    if (passed) {
      results.passed++;
      console.log(`✅ ${name} - Passed`);
    } else {
      results.failed++;
      console.log(`❌ ${name} - Failed`);
      console.log(`   Expected status: ${expectedStatus}, Got: ${status}`);
      if (!validationPassed) {
        console.log(`   Validation failed: ${validationError || 'Custom validation failed'}`);
      }
      if (data) {
        console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      }
    }
  } catch (error) {
    results.failed++;
    results.tests.push({
      name,
      url,
      passed: false,
      error: error.message
    });
    console.log(`❌ ${name} - Error: ${error.message}`);
  }
}

// Authentication helper
let authToken = null;
async function login() {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    if (response.status === 200) {
      const data = await response.json();
      authToken = data.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting API tests...');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Public endpoints
  await testEndpoint(
    'Products API', 
    '/api/products',
    {},
    200,
    (data) => data.products && Array.isArray(data.products)
  );
  
  await testEndpoint(
    'Product Detail API', 
    '/api/products/1',
    {},
    200,
    (data) => data.id && data.name
  );
  
  // Authentication
  const isAuthenticated = await login();
  
  if (isAuthenticated && authToken) {
    const authHeader = {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    // Admin endpoints
    await testEndpoint(
      'Admin Orders API', 
      '/api/admin/orders',
      authHeader,
      200,
      (data) => Array.isArray(data.orders)
    );
    
    await testEndpoint(
      'Admin Products API', 
      '/api/admin/products',
      authHeader,
      200,
      (data) => Array.isArray(data.products)
    );
    
    await testEndpoint(
      'Admin Users API', 
      '/api/admin/users',
      authHeader,
      200,
      (data) => Array.isArray(data.users)
    );
  } else {
    console.log('⚠️ Skipping authenticated tests due to login failure');
    results.skipped += 3; // Skipping 3 admin endpoints
  }
  
  // Print summary
  console.log('\n--- Test Summary ---');
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`- ${test.name} (${test.url})`);
        if (test.error) {
          console.log(`  Error: ${test.error}`);
        } else {
          console.log(`  Expected status: ${test.expectedStatus}, Got: ${test.status}`);
          if (!test.validationPassed) {
            console.log(`  Validation failed: ${test.validationError || 'Custom validation failed'}`);
          }
        }
      });
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
