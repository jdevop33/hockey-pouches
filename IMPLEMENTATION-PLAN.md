# Hockey Pouches Implementation Plan

This document outlines the detailed implementation steps for the new features and fixes requested.

## 1. Update Product Pricing to $15 Per Unit

### Database Updates

- Create a database migration to update all product prices in the `products` table
- Create a similar migration for product variations in the `product_variations` table

### API Updates

- Modify the product creation and update endpoints to enforce the $15 price
- Update any API endpoints that calculate product pricing
- Fix discount calculations to work with the new fixed pricing

### UI Updates

- Update admin product creation/editing forms to default to $15 and potentially restrict editing
- Modify product display components to handle the fixed pricing
- Update cart calculations to reflect the new pricing

### Implementation Steps:

1. Create database migration scripts
2. Update product API endpoints with validation
3. Modify admin UI to enforce $15 pricing
4. Test all price-related functionality
5. Update product listing pages to reflect new pricing

## 2. Implement 5-Unit Minimum Order Requirement

### Shopping Cart Updates

- Modify the CartContext to validate minimum quantity
- Update addToCart function to enforce minimum quantities
- Add validation for the total cart quantity at checkout

### Checkout Process Updates

- Add server-side validation in the order creation API
- Update checkout UI to show minimum order requirement
- Add helpful messaging to inform users about the minimum

### UI Updates

- Update product detail pages to show minimum order quantity
- Modify cart UI to display minimum order requirements
- Update error messaging when minimum is not met

### Implementation Steps:

1. Update CartContext with minimum order validation
2. Modify the checkout process validation
3. Update the UI to clearly indicate minimum requirements
4. Add server-side validation for all order endpoints
5. Test various order quantities and combinations

## 3. Add Wholesale Buyer Role & 100+ Unit Orders

### Database Updates

- Update the `users` table to include "Wholesale Buyer" as a valid role
- Add any necessary fields to track wholesale-specific data
- Create migration to update the schema

### User Registration Flow

- Modify the registration page to include wholesale option
- Update the admin approval process to handle wholesale accounts
- Add validation to ensure only approved accounts can make wholesale orders

### Order Processing

- Add logic to identify orders of 100+ units as wholesale orders
- Create special handling for wholesale orders in the admin dashboard
- Implement tracking of which users qualify for wholesale status

### Admin Dashboard

- Create wholesale user management section
- Add wholesale order processing views
- Implement approval workflow for wholesale accounts

### Implementation Steps:

1. Create database migrations for user role updates
2. Modify user registration to include wholesale option
3. Update admin approval workflow for wholesale accounts
4. Add wholesale order validation (100+ units)
5. Create wholesale-specific admin views
6. Implement wholesale user dashboard
7. Test the entire wholesale user journey

## 4. Fix Non-Working Admin Dashboard Links

### Audit Phase

- Systematically check all links in the admin dashboard
- Document broken links and identify patterns
- Categorize issues by type (404, incorrect route, permission issues)

### Implementation Phase

- Fix routing issues in admin dashboard components
- Ensure proper permission checks are in place
- Update navigation components with correct routes

### Testing Phase

- Verify all links work as expected
- Test with different user roles to ensure proper access control
- Check mobile responsiveness of fixed links

### Implementation Steps:

1. Audit all links in the admin dashboard
2. Categorize and prioritize issues
3. Fix routing and navigation components
4. Implement proper permission checks
5. Test with different user roles and devices

## Timeline and Priorities

### Week 1: Pricing Updates and Basic Fixes

- Update all product prices to $15
- Fix critical admin dashboard links
- Update database schema for pricing standardization
- Begin UI updates to reflect new pricing

### Week 2: Minimum Order Implementation and Dashboard Fixes

- Implement 5-unit minimum order requirement
- Complete admin dashboard link fixes
- Update UI to indicate minimum order requirements
- Begin wholesale role implementation

### Week 3: Wholesale Role Implementation

- Complete wholesale user role database updates
- Implement wholesale registration and approval flow
- Create wholesale-specific admin views
- Build wholesale order validation (100+ units)

### Week 4: Testing and Refinement

- Comprehensive testing of all new features
- Fix any issues identified during testing
- Optimize user experience
- Prepare for deployment

## Technical Considerations

### Backwards Compatibility

- Handle existing orders with different pricing
- Ensure existing accounts transition smoothly
- Consider migration path for current cart items

### Performance Impact

- Monitor database performance after price updates
- Evaluate impact of additional validation steps
- Optimize checkout process with new validations

### Security Considerations

- Ensure proper authentication for wholesale accounts
- Validate all price calculations server-side
- Implement proper authorization for admin functions
