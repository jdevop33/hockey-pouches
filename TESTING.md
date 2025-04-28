# Hockey Pouches Testing Guide

This document provides a comprehensive guide for testing the Hockey Pouches e-commerce application. It includes both automated and manual testing procedures to ensure the application functions correctly.

## Automated Testing

### API Testing

We've created a simple API testing script that checks the functionality of key endpoints. To run the tests:

```bash
npm run test:api
```

By default, the tests run against the local development server. To test against the production server:

```bash
API_BASE_URL=https://hockey-pouches.vercel.app npm run test:api
```

### What's Tested

The automated tests check:

1. **Public Endpoints**:

   - Products listing
   - Product details

2. **Admin Endpoints** (requires authentication):
   - Orders listing
   - Products management
   - Users management

## Manual Testing Checklist

### User Authentication

- [ ] User registration works correctly
- [ ] User login works correctly
- [ ] Password reset functionality works
- [ ] User logout works correctly
- [ ] Authentication persists across page refreshes
- [ ] Protected routes are properly secured

### Product Browsing

- [ ] Products list loads correctly
- [ ] Product filtering works (category, flavor, strength, price)
- [ ] Product sorting works (name, price, etc.)
- [ ] Product search works
- [ ] Product details page shows correct information
- [ ] Product images load correctly

### Shopping Cart

- [ ] Adding products to cart works
- [ ] Updating product quantities in cart works
- [ ] Removing products from cart works
- [ ] Cart persists across page refreshes
- [ ] Cart total is calculated correctly

### Checkout Process

- [ ] Checkout form validation works
- [ ] Address entry works correctly
- [ ] Order summary shows correct items and totals
- [ ] Order confirmation is displayed after successful checkout
- [ ] Order is correctly stored in the database

### Admin Dashboard

- [ ] Admin can view all orders
- [ ] Admin can view order details
- [ ] Admin can update order status
- [ ] Admin can assign distributors to orders
- [ ] Admin can view all products
- [ ] Admin can add/edit/delete products
- [ ] Admin can view all users
- [ ] Admin can manage user accounts

### Distributor Dashboard

- [ ] Distributor can view assigned orders
- [ ] Distributor can update order fulfillment status
- [ ] Distributor can add tracking information
- [ ] Distributor can upload fulfillment photos

### Referral System

- [ ] Users can generate referral codes
- [ ] Referral codes are tracked correctly
- [ ] Commissions are calculated correctly
- [ ] Referral statistics are displayed correctly

### Mobile Responsiveness

- [ ] Test all pages on mobile devices
- [ ] Test all forms and interactive elements on mobile
- [ ] Verify navigation works correctly on mobile
- [ ] Check image scaling and layout on different screen sizes

## Checkout Process Testing

### Prerequisites

- Create a test user account
- Ensure there are products available in the database
- Clear any existing items in the cart

### Test Scenarios

#### 1. Cart to Checkout Flow

- [ ] Add at least 5 items to cart (ensuring minimum quantity is met)
- [ ] Navigate to cart page and verify all items show correctly
- [ ] Click "Proceed to Checkout" to navigate to checkout page
- [ ] Verify user is redirected to login if not authenticated
- [ ] After login, verify user is redirected back to checkout

#### 2. Minimum Order Validation

- [ ] Add fewer than 5 items to cart
- [ ] Attempt to proceed to checkout
- [ ] Verify proper error message about minimum order quantity
- [ ] Add more items to meet minimum
- [ ] Verify checkout page now loads correctly

#### 3. Shipping Information

- [ ] Fill in shipping information with valid data
- [ ] Test address validation by submitting with missing fields
- [ ] Verify proper error messages appear for each required field
- [ ] Test postal code validation with invalid formats
- [ ] Verify "Use shipping address for billing" checkbox functions correctly

#### 4. Payment Method Selection

- [ ] Test each payment method selection (e-transfer, bitcoin, credit card)
- [ ] Verify appropriate instructions appear for each method
- [ ] Test discount code application with:
  - Valid discount code
  - Invalid discount code
  - Expired discount code
- [ ] Verify correct discount is applied and shown in order summary

#### 5. Order Placement

- [ ] Submit order with all valid information
- [ ] Verify order is created in database with correct status
- [ ] Check that cart is cleared after successful order
- [ ] Verify correct redirect to success page
- [ ] Confirm order ID is displayed on success page
- [ ] Verify payment instructions match selected method

#### 6. Email Notifications

- [ ] Check that order confirmation email is sent to customer
- [ ] Verify order notification email is sent to admin
- [ ] Check that payment instructions are included in customer email
- [ ] Confirm email contains correct order details and totals

#### 7. Order Status Tracking

- [ ] Navigate to order details page from success page
- [ ] Verify all order information displays correctly
- [ ] Check that order status shows as "Pending Payment" or appropriate initial status
- [ ] Test admin interface for order status updates
- [ ] Verify status changes are reflected in customer order view

#### 8. Mobile Responsiveness

- [ ] Test entire checkout flow on mobile device or emulator
- [ ] Verify all form fields are accessible and usable
- [ ] Confirm payment method selection works on small screens
- [ ] Check that error messages display properly on mobile

### Integration Testing

- [ ] Test complete flow from product selection through checkout to order confirmation
- [ ] Verify inventory is updated correctly after order placement
- [ ] Test with multiple browser sessions to check for race conditions

### Error Recovery

- [ ] Test checkout recovery after session timeout
- [ ] Verify proper handling of network interruptions during checkout
- [ ] Test browser refresh/reload during checkout process

## How to Run Tests

### Manual Testing

Follow the scenarios above and document results in the project issue tracker.

### Automated Testing

Automated tests can be run with:

```bash
npm run test:e2e
```

This will execute end-to-end tests for the checkout process using Playwright.

## Reporting Issues

When reporting issues with the checkout process, please include:

1. Test scenario being executed
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser and device information

## Common Issues and Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Check that the database connection string is correct
2. Verify that the database server is running
3. Check for network connectivity issues

### API Errors

If API endpoints return errors:

1. Check the server logs for detailed error messages
2. Verify that the request format is correct
3. Check authentication tokens if accessing protected endpoints

### Authentication Issues

If users cannot log in or access protected routes:

1. Clear browser cookies and try again
2. Check that the JWT secret is correctly configured
3. Verify that the user account exists and is active

## Reporting Issues

When reporting issues, please include:

1. The specific page or feature where the issue occurs
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Browser and device information
6. Screenshots or error messages if available

## Continuous Improvement

This testing guide is a living document. As new features are added or issues are discovered, please update this guide to help maintain the quality of the application.
