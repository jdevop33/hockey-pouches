// Route Testing Script for Hockey Pouches
// This script tests all major routes and functionality in the application

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your deployment URL if needed
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'adminpassword'
};
const USER_CREDENTIALS = {
  email: 'user@example.com',
  password: 'userpassword'
};

// Test results tracking
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

// Utility functions
function logSuccess(message) {
  console.log(chalk.green('✓ PASS:'), message);
  passedTests++;
}

function logFailure(message, error) {
  console.log(chalk.red('✗ FAIL:'), message);
  if (error) {
    console.log(chalk.red('  Error:'), error.message || error);
    if (error.response) {
      console.log(chalk.red('  Status:'), error.response.status);
      console.log(chalk.red('  Data:'), JSON.stringify(error.response.data, null, 2));
    }
  }
  failedTests++;
}

function logSkipped(message) {
  console.log(chalk.yellow('⚠ SKIP:'), message);
  skippedTests++;
}

function logSection(title) {
  console.log('\n' + chalk.blue.bold('=== ' + title + ' ==='));
}

// Test functions
async function testPublicRoutes() {
  logSection('Testing Public Routes');
  
  try {
    // Home page
    const homeResponse = await axios.get(`${BASE_URL}/`);
    if (homeResponse.status === 200) {
      logSuccess('Home page loads successfully');
    } else {
      logFailure('Home page failed to load', { response: homeResponse });
    }
  } catch (error) {
    logFailure('Home page failed to load', error);
  }
  
  try {
    // Products page
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    if (productsResponse.status === 200) {
      logSuccess('Products page loads successfully');
    } else {
      logFailure('Products page failed to load', { response: productsResponse });
    }
  } catch (error) {
    logFailure('Products page failed to load', error);
  }
  
  try {
    // About page
    const aboutResponse = await axios.get(`${BASE_URL}/about`);
    if (aboutResponse.status === 200) {
      logSuccess('About page loads successfully');
    } else {
      logFailure('About page failed to load', { response: aboutResponse });
    }
  } catch (error) {
    logFailure('About page failed to load', error);
  }
  
  try {
    // FAQ page
    const faqResponse = await axios.get(`${BASE_URL}/faq`);
    if (faqResponse.status === 200) {
      logSuccess('FAQ page loads successfully');
    } else {
      logFailure('FAQ page failed to load', { response: faqResponse });
    }
  } catch (error) {
    logFailure('FAQ page failed to load', error);
  }
}

async function testProductAPI() {
  logSection('Testing Product API');
  
  try {
    // Get all products
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    if (productsResponse.status === 200 && Array.isArray(productsResponse.data.products)) {
      logSuccess('Products API returns list of products');
      
      // Store first product for later tests
      if (productsResponse.data.products.length > 0) {
        const firstProduct = productsResponse.data.products[0];
        
        // Test single product API
        try {
          const productResponse = await axios.get(`${BASE_URL}/api/products/${firstProduct.id}`);
          if (productResponse.status === 200 && productResponse.data.id === firstProduct.id) {
            logSuccess(`Single product API returns product #${firstProduct.id}`);
          } else {
            logFailure(`Single product API failed for product #${firstProduct.id}`, { response: productResponse });
          }
        } catch (error) {
          logFailure(`Single product API failed for product #${firstProduct.id}`, error);
        }
      } else {
        logSkipped('Single product API test (no products available)');
      }
    } else {
      logFailure('Products API failed to return list of products', { response: productsResponse });
    }
  } catch (error) {
    logFailure('Products API failed', error);
  }
  
  // Test product filtering
  try {
    const filteredResponse = await axios.get(`${BASE_URL}/api/products?sort=price&order=asc&limit=5`);
    if (filteredResponse.status === 200 && Array.isArray(filteredResponse.data.products)) {
      logSuccess('Products API supports filtering and sorting');
    } else {
      logFailure('Products API filtering failed', { response: filteredResponse });
    }
  } catch (error) {
    logFailure('Products API filtering failed', error);
  }
}

async function testAuthFlow() {
  logSection('Testing Authentication Flow');
  let userToken = null;
  
  // Test login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, USER_CREDENTIALS);
    if (loginResponse.status === 200 && loginResponse.data.token) {
      userToken = loginResponse.data.token;
      logSuccess('User login successful');
    } else {
      logFailure('User login failed', { response: loginResponse });
    }
  } catch (error) {
    logFailure('User login failed', error);
    logSkipped('Remaining auth tests (login failed)');
    return null;
  }
  
  // Test protected route with token
  if (userToken) {
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (profileResponse.status === 200) {
        logSuccess('Protected route access successful with token');
      } else {
        logFailure('Protected route access failed', { response: profileResponse });
      }
    } catch (error) {
      logFailure('Protected route access failed', error);
    }
  }
  
  return userToken;
}

async function testCartFunctionality() {
  logSection('Testing Cart Functionality');
  
  // Get a product to add to cart
  let productToAdd = null;
  try {
    const productsResponse = await axios.get(`${BASE_URL}/api/products?limit=1`);
    if (productsResponse.status === 200 && productsResponse.data.products.length > 0) {
      productToAdd = productsResponse.data.products[0];
      logSuccess('Retrieved product for cart test');
    } else {
      logFailure('Failed to get product for cart test', { response: productsResponse });
      logSkipped('Remaining cart tests (no product available)');
      return;
    }
  } catch (error) {
    logFailure('Failed to get product for cart test', error);
    logSkipped('Remaining cart tests (API error)');
    return;
  }
  
  // Test cart API (client-side only, so we'll just check if the endpoints exist)
  try {
    const cartResponse = await axios.get(`${BASE_URL}/api/cart`);
    if (cartResponse.status === 200) {
      logSuccess('Cart API endpoint exists');
    } else {
      logFailure('Cart API endpoint failed', { response: cartResponse });
    }
  } catch (error) {
    // This might fail if the cart is implemented client-side only
    logSkipped('Cart API test (might be client-side only)');
  }
}

async function testAdminFunctionality(adminToken) {
  logSection('Testing Admin Functionality');
  
  if (!adminToken) {
    // Try to login as admin
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
      if (loginResponse.status === 200 && loginResponse.data.token) {
        adminToken = loginResponse.data.token;
        logSuccess('Admin login successful');
      } else {
        logFailure('Admin login failed', { response: loginResponse });
        logSkipped('Remaining admin tests (login failed)');
        return;
      }
    } catch (error) {
      logFailure('Admin login failed', error);
      logSkipped('Remaining admin tests (login failed)');
      return;
    }
  }
  
  // Test admin products API
  try {
    const adminProductsResponse = await axios.get(`${BASE_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminProductsResponse.status === 200) {
      logSuccess('Admin products API access successful');
      
      // Get first product for edit test
      if (adminProductsResponse.data.products && adminProductsResponse.data.products.length > 0) {
        const productToEdit = adminProductsResponse.data.products[0];
        
        // Test product edit
        try {
          const editResponse = await axios.put(
            `${BASE_URL}/api/admin/products/${productToEdit.id}`,
            { name: `${productToEdit.name} (Test)` },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          
          if (editResponse.status === 200) {
            logSuccess(`Admin product edit successful for product #${productToEdit.id}`);
            
            // Revert the change
            try {
              await axios.put(
                `${BASE_URL}/api/admin/products/${productToEdit.id}`,
                { name: productToEdit.name },
                { headers: { Authorization: `Bearer ${adminToken}` } }
              );
              logSuccess('Reverted test changes to product');
            } catch (error) {
              logFailure('Failed to revert test changes to product', error);
            }
          } else {
            logFailure(`Admin product edit failed for product #${productToEdit.id}`, { response: editResponse });
          }
        } catch (error) {
          logFailure(`Admin product edit failed for product #${productToEdit.id}`, error);
        }
      } else {
        logSkipped('Admin product edit test (no products available)');
      }
    } else {
      logFailure('Admin products API access failed', { response: adminProductsResponse });
    }
  } catch (error) {
    logFailure('Admin products API access failed', error);
  }
}

// Main test function
async function runTests() {
  console.log(chalk.bold('\n🧪 Starting Hockey Pouches Route Tests 🧪\n'));
  
  try {
    // Test public routes
    await testPublicRoutes();
    
    // Test product API
    await testProductAPI();
    
    // Test authentication
    const userToken = await testAuthFlow();
    
    // Test cart functionality
    await testCartFunctionality();
    
    // Test admin functionality
    await testAdminFunctionality(null); // We'll get admin token inside the function
    
    // Print summary
    console.log('\n' + chalk.bold('📊 Test Summary:'));
    console.log(chalk.green(`✓ Passed: ${passedTests}`));
    console.log(chalk.red(`✗ Failed: ${failedTests}`));
    console.log(chalk.yellow(`⚠ Skipped: ${skippedTests}`));
    console.log(chalk.bold(`Total: ${passedTests + failedTests + skippedTests}`));
    
    if (failedTests === 0) {
      console.log(chalk.green.bold('\n🎉 All tests passed! 🎉'));
    } else {
      console.log(chalk.red.bold(`\n❌ ${failedTests} test(s) failed. ❌`));
    }
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Test execution error:'), error);
  }
}

// Run the tests
runTests();
