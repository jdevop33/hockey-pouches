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

### Implementation Steps (Week 1):

1. Create database migration scripts

   - Script to update existing products in the products table
   - Script to update product variations table
   - Test script in development before running in production

2. Update product API endpoints with validation

   - Modify `/api/products/[productId]` endpoint to enforce $15 pricing
   - Add validation in product creation endpoint
   - Update any price calculation logic in API routes

3. Modify admin UI to enforce $15 pricing

   - Update product creation form to set $15 as default and read-only
   - Modify product editing UI to prevent price changes
   - Add clear messaging explaining the fixed pricing model

4. Test all price-related functionality

   - Verify prices show correctly in product listings
   - Test cart calculations with the new pricing
   - Check discount application with fixed pricing

5. Update product listing pages to reflect new pricing
   - Ensure consistency across all product displays
   - Update any filter components that use price ranges

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

- Update product detail pages to show minimum order requirement
- Modify cart UI to display minimum order requirements
- Update error messaging when minimum is not met

### Implementation Steps (Week 1):

1. Update CartContext with minimum order validation

   - Modify `/app/context/CartContext.tsx` to add minimum order validation
   - Update the addToCart function to enforce minimum total quantities
   - Add clear error messaging for quantity requirements

2. Modify the checkout process validation

   - Update `/app/api/orders/route.ts` to validate minimum order quantity
   - Add quantity checks in the `/app/api/checkout` endpoint
   - Implement consistent error handling for minimum quantity violations

3. Update the UI to clearly indicate minimum requirements

   - Add minimum quantity indicators to product pages
   - Update cart UI to show progress toward minimum order requirement
   - Create helpful tooltip explaining the minimum order policy

4. Add server-side validation for all order endpoints

   - Ensure all API routes that create orders enforce the minimum quantity
   - Add validation to the order management endpoints
   - Update error responses with clear messaging

5. Test various order quantities and combinations
   - Verify cart prevents checkout with insufficient quantities
   - Test server-side validation with direct API calls
   - Check that proper error messages are displayed

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

### Week 1 (Sep 11-17): Pricing Updates and Order Requirements

- Update all product prices to $15
- Implement 5-unit minimum order requirement
- Fix critical linting errors (completed)
- Begin testing API error handling edge cases
- Continue dark mode implementation for remaining UIs

### Week 2 (Sep 18-24): Wholesale Implementation and Dashboard Fixes

- Complete Wholesale Buyer role implementation
- Add 100+ unit order processing for wholesale
- Fix all non-working admin dashboard links
- Complete Distributor dashboard dark mode conversion
- Finalize checkout flow with all validations

### Week 3 (Sep 25-Oct 1): Testing and Optimization

- Implement comprehensive test suite
- Conduct UX testing across all user journeys
- Optimize database queries for better performance
- Implement image optimization and caching strategies
- Add analytics tracking for user behavior

### Week 4 (Oct 2-8): Quality Assurance and Security

- Conduct load testing with expected traffic patterns
- Address all issues discovered during testing
- Optimize mobile experience and performance
- Complete security audit and fix vulnerabilities
- Update documentation for all new features

### Week 5 (Oct 9-15): Pre-Launch Preparation

- Set up production environment with proper CI/CD
- Configure SSL certificates and security headers
- Implement automated database backup solutions
- Set up monitoring and alerting systems
- Create detailed launch checklist and rollback plan

### Week 6 (Oct 16-22): Launch and Initial Support

- Prepare marketing materials for product launch
- Conduct soft launch with limited user access
- Official public launch
- Closely monitor system performance
- Provide immediate support for any issues
- Collect and analyze initial user feedback

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

## Success Criteria

- All pages render correctly in dark mode on both mobile and desktop
- Orders successfully enforce minimum 5-unit requirement
- Products are consistently priced at $15 per unit
- Wholesale accounts function properly with 100+ unit orders
- All dashboard links function correctly
- System handles projected load with <2s response times
- Zero critical security vulnerabilities
