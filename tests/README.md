# Hockey Pouches Test Suite

This directory contains test scripts for the Hockey Pouches application.

## Route Testing Script

The `route-test.js` script tests all major routes and functionality in the application, including:

- Public routes (home, products, about, FAQ)
- Product API
- Authentication flow
- Cart functionality
- Admin functionality

## Setup

1. Install dependencies:
   ```
   cd tests
   npm install
   ```

2. Configure the test script:
   - Open `route-test.js` and update the `BASE_URL` constant to point to your deployment URL if needed
   - Update the `ADMIN_CREDENTIALS` and `USER_CREDENTIALS` constants with valid credentials

## Running Tests

```
cd tests
npm test
```

## Test Results

The test script will output results in the console, with color-coded indicators:
- ✓ Green: Passed tests
- ✗ Red: Failed tests
- ⚠ Yellow: Skipped tests

A summary of passed, failed, and skipped tests will be displayed at the end.

## Troubleshooting

If tests are failing, check the following:
1. Make sure the application is running at the specified `BASE_URL`
2. Verify that the credentials in the test script are valid
3. Check the error messages for specific API failures
4. Ensure all required API endpoints are implemented correctly
