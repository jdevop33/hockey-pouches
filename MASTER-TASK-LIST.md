# Hockey Pouches Master Task List

This document serves as the single source of truth for all tasks related to the Hockey Pouches e-commerce platform, consolidating information from various project documents to keep everyone aligned and organized.

## Project Overview

Hockey Pouches is a premium e-commerce platform for nicotine pouches that supports multiple user roles (customers, distributors, admins), features a custom backend implementation (replaced Medusa.js), and includes specialized functionality for wholesale buyers, commission tracking, and order fulfillment.

## Current Project Status (May 2025)

### Completed Initiatives

1. **Custom Backend Implementation**

   - ✅ Removed Medusa.js dependencies
   - ✅ Created custom product service
   - ✅ Implemented commission calculation and payout service
   - ✅ Added wholesale application approval workflow
   - ✅ Implemented wholesale order validation with minimum units check

2. **User Interface & Experience**

   - ✅ Dark mode implementation for majority of interfaces (homepage, admin dashboard, etc.)
   - ✅ Improved responsive design for most pages
   - ✅ Enhanced cart and checkout experience

3. **Administrative Features**

   - ✅ Fixed missing Distribution Management page
   - ✅ Fixed missing Settings page with store configuration options
   - ✅ Converted Reports page to dark mode with enhanced data visualization
   - ✅ Fixed accessibility issues in the Settings page

4. **Copywriting & Content**

   - ✅ Updated website copy across all main pages using persuasion principles
   - ✅ Enhanced product descriptions with benefit-focused language
   - ✅ Improved checkout flow copy for premium brand positioning
   - ✅ Updated legal pages with more user-friendly language

5. **Database & Pricing**
   - ✅ Updated all product prices to standard $15 CAD
   - ✅ Created custom_pricing table for wholesale-specific pricing

## In-Progress Tasks (Priority Order)

### 1. Product Pricing & Display Fixes (Critical Priority)

- [ ] **Product Pricing Corrections**

  - [x] Fix product pricing on /products page to show correct retail price ($15 CAD)
  - [x] Ensure all products display standard $15 CAD pricing by default
  - [ ] Implement role-based pricing visibility (retail vs. wholesale)
  - [ ] Create admin interface for setting custom pricing for wholesale accounts

- [ ] **Age Verification Update**

  - [ ] Update age verification to reflect Canadian requirement (19+ not 21+)
  - [ ] Ensure verification notices appear consistently across the platform
  - [ ] Add regional age verification logic based on user location

- [ ] **Product Detail Pages Enhancement**
  - [ ] Create compelling product detail pages with consistent brand voice
  - [ ] Implement proper product image galleries
  - [ ] Add customer reviews section
  - [ ] Ensure all product variations are properly displayed

### 2. Backend Refinement (High Priority)

- [ ] **API Route Fixes**

  - [ ] Fix remaining TypeScript and accessibility issues in API routes
  - [ ] Implement proper error handling for all endpoints
  - [ ] Complete input validation with Zod schemas

- [ ] **Financial Systems Completion**

  - [ ] Finish commission calculation edge cases
  - [ ] Implement payout processing workflows
  - [ ] Create financial reporting dashboard

- [ ] **Wholesale Functionality**
  - [ ] Complete wholesale application validation
  - [ ] Implement admin approval process UI
  - [ ] Create wholesale-specific order processing
  - [ ] Add custom pricing management for individual wholesale accounts

### 3. User Interface Completion (High Priority)

- [ ] **Dark Mode Implementation**

  - [ ] Complete user dashboard pages conversion
  - [ ] Finish distributor dashboard pages
  - [ ] Finalize checkout flow dark mode styling

- [ ] **Mobile Optimization**

  - [ ] Test all interfaces on mobile devices
  - [ ] Fix any responsive issues
  - [ ] Optimize for touch interactions

- [ ] **User Dashboard**
  - [ ] Complete profile management functionality
  - [ ] Add order history with status tracking
  - [ ] Implement saved addresses management

### 4. Performance & Security (Medium Priority)

- [ ] **Performance Improvements**

  - [ ] Implement image optimization
  - [ ] Add proper caching strategies
  - [ ] Optimize database queries

- [ ] **Security Enhancements**
  - [ ] Implement CSRF protection
  - [ ] Add input sanitization
  - [ ] Implement rate limiting
  - [ ] Add audit logging

### 5. Testing & Quality Assurance (Medium Priority)

- [ ] **End-to-End Testing**

  - [ ] Create comprehensive test suite for critical user flows
  - [ ] Implement automated API testing
  - [ ] Test all payment flows

- [ ] **Cross-Browser & Device Testing**
  - [ ] Test on major browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Verify functionality on iOS and Android devices
  - [ ] Test different screen sizes and resolutions

## Content & Copywriting

### Completed Copywriting Tasks

- ✅ Home Page: Updated with more accessible, benefit-focused language
- ✅ About Page: Made more relatable with clearer value propositions
- ✅ Product Pages: Enhanced with benefit-focused descriptions and persuasive elements
- ✅ FAQ Page: Rewritten to be more conversational and user-focused
- ✅ Contact Page: Updated with more personal, relationship-focused language
- ✅ Cart & Checkout: Enhanced with premium, luxury-oriented messaging
- ✅ Miscellaneous Pages: Updated Terms, Privacy Policy, and error pages

### Content Next Steps

1. [ ] Product Detail Pages: Create compelling product-specific copy that maintains brand voice
2. [ ] Conduct A/B testing on product page copy to measure conversion impact
3. [ ] Create comprehensive style guide for voice and tone
4. [ ] Develop standardized templates for new product descriptions
5. [ ] Prepare monthly content calendar for blog/email marketing

## Technical Implementation Details

### Service-Based Architecture

We've implemented a service-based architecture to replace the Medusa.js dependency:

1. **ProductService** - Handles product-related operations
   - Must enforce $15 CAD standard pricing for retail customers
   - Support customized pricing for admin-approved wholesale accounts
2. **CommissionService** - Manages commission calculations and payouts
3. **WholesaleService** - Handles wholesale applications and order validation
4. **OrderService** - Manages order lifecycle
5. **UserService** - Handles user management and roles

### Database Schema Updates

Added several new tables to support our custom implementation:

1. **wholesale_applications** - Stores wholesale buyer applications
2. **payouts** - Tracks commission payout batches
3. **notifications** - System notifications for users
4. **custom_pricing** - Stores user-specific pricing set by admins for wholesale accounts

## End-to-End Business Management System

The platform provides a comprehensive solution with interconnected systems:

1. **Inventory Management**

   - Real-time inventory tracking across variations
   - Low stock alerts
   - Warehouse location tracking

2. **Order Processing Workflow**

   - End-to-end order lifecycle management
   - Status tracking for all stakeholders
   - Automated notifications

3. **Multi-tiered User Management**

   - Customer tier: Retail ($15 CAD pricing) and wholesale (custom pricing)
   - Distributor tier: Order fulfillment and commission tracking
   - Admin tier: System management, reporting, and wholesale pricing control

4. **Commission and Payment System**

   - Automated commission calculation
   - Distributor payout processing
   - Commission history and projections

5. **Analytics and Reporting**
   - Sales analytics with trend identification
   - Inventory forecasting
   - Distributor performance metrics
   - Financial reporting

## Production Deployment Checklist

1. **Pre-Deployment Tasks**

   - [ ] Update all environment variables
   - [ ] Verify database connection strings
   - [ ] Check payment processor integration
   - [ ] Verify all products display correct $15 CAD pricing

2. **Deployment Process**

   - [ ] Run database migrations
   - [ ] Deploy backend services
   - [ ] Deploy frontend assets
   - [ ] Verify static assets are properly cached

3. **Post-Deployment Verification**
   - [ ] Verify all API endpoints are working
   - [ ] Test user authentication flows
   - [ ] Validate order processing end-to-end
   - [ ] Check commission calculations
   - [ ] Verify analytics tracking
   - [ ] Confirm product pricing displays correctly for different user roles

## Future Enhancements (Post-Initial Release)

1. **Subscription Model**

   - Regular delivery schedules
   - Subscription management dashboard
   - Automated billing

2. **Advanced Analytics**

   - Predictive inventory management
   - Customer lifetime value calculation
   - Trend analysis and forecasting

3. **Mobile Application**

   - Native mobile experience
   - Barcode scanning for distributors
   - Push notifications

4. **International Expansion**
   - Multi-currency support
   - Localization for different markets
   - International shipping and tax calculation
   - Region-specific age verification requirements

## Technical Debt Tracking

1. **Code Quality**

   - TypeScript errors in API routes
   - Lack of proper error handling in some services
   - Missing validation for user inputs

2. **Documentation**

   - Incomplete API documentation
   - Missing JSDocs in some components
   - Need for architectural diagrams

3. **Testing**
   - Incomplete test coverage
   - Missing E2E tests for critical flows
   - Need for performance testing

## Resources & Documentation

- **Database**: See `db/migrations/` for schema definitions
- **API Documentation**: Visit `/docs/api` in development environment
- **Testing Guide**: See `TESTING.md` for manual and automated testing procedures
- **Codebase Navigation**: See `PROJECT-STRUCTURE.md` for detailed information

## Notes for Development Team

- Follow consistent error handling patterns
- Use modular architecture for service components
- Implement proper logging
- Document API endpoints comprehensively
- Add JSDocs to functions and components
- When working on copywriting, follow persuasion principles from Cialdini's "Influence" and writing guidelines from "Sin and Syntax"
- All retail products must be priced at $15 CAD by default; only admin-approved wholesale accounts can have custom pricing

## Database Operations Reference

### Product Pricing Management

```sql
-- Update all products to standard $15 CAD price
UPDATE products
SET price = 15.00
WHERE price != 15.00;

-- Check current product pricing
SELECT id, name, price, compare_at_price
FROM products
ORDER BY id;

-- Sample query to get wholesale pricing for a user
SELECT cp.product_id, p.name, cp.price as wholesale_price, p.price as retail_price
FROM custom_pricing cp
JOIN products p ON cp.product_id = p.id
WHERE cp.user_id = '[UUID_GOES_HERE]';
```

## UPDATED: Database Implementation & API Development (URGENT PRIORITY)

### 1. Database Architecture & Implementation

- [ ] **Database Schema Finalization**

  - [ ] Complete normalized schema design for all entities
  - [ ] Create migration scripts for production database
  - [ ] Document relationships between tables with ERD diagrams

- [ ] **Replace Mock Database with Production Database**

  - [ ] Remove all instances of mockPool and mockSql from app/lib/db.ts
  - [ ] Implement proper database connection pooling with error handling
  - [ ] Add database monitoring and logging for production

- [ ] **Data Migration & Seeding**
  - [ ] Create initial seed data scripts for products, categories, and configs
  - [ ] Implement data validation before inserting into production database
  - [ ] Test database performance with realistic data volumes

### 2. API Development & Real Services Implementation

- [ ] **Product Service Enhancement**

  - [ ] Replace mock product data in app/products/page.tsx with real API calls
  - [ ] Implement complete CRUD operations in ProductService
  - [ ] Add proper error handling and validation for all product endpoints
  - [ ] Create robust product search with filters and pagination

- [ ] **User & Authentication Service**

  - [ ] Implement JWT or session-based authentication system
  - [ ] Create role-based authorization middleware
  - [ ] Develop secure password reset and account verification flows
  - [ ] Replace placeholder authentication in all pages

- [ ] **Order & Checkout Service**

  - [ ] Implement real order processing workflow
  - [ ] Create order status tracking and management
  - [ ] Develop robust cart validation and price calculation
  - [ ] Build secure checkout process with payment integration

- [ ] **Commission & Distributor Service**

  - [ ] Replace placeholder distributor dashboard data with real API calls
  - [ ] Implement commission calculation based on actual sales data
  - [ ] Create commission payout tracking and history
  - [ ] Build distributor performance analytics

- [ ] **Inventory & Warehouse Management**
  - [ ] Create real-time inventory tracking system
  - [ ] Implement multi-location inventory management
  - [ ] Develop low stock alerts and reordering system
  - [ ] Build inventory audit and reconciliation tools

### 3. Testing & Validation

- [ ] **API Testing Suite**

  - [ ] Create comprehensive unit tests for all services
  - [ ] Implement integration tests for critical API workflows
  - [ ] Develop load testing for high-traffic endpoints
  - [ ] Set up continuous integration for API tests

- [ ] **Data Integrity & Validation**
  - [ ] Implement Zod schemas for all API request/response validation
  - [ ] Add database constraints and triggers for data integrity
  - [ ] Create data validation middleware for all endpoints
  - [ ] Test edge cases and boundary conditions

## Mock Data Replacement Plan

### Identified Mock Data Sources

1. **Product System**

   - [ ] Replace mockProducts in app/products/page.tsx
   - [ ] Implement real product detail fetching in app/products/[id]/page.tsx
   - [ ] Replace placeholder product images with actual product photos

2. **User Authentication**

   - [ ] Replace isAuthenticated placeholders in all pages
   - [ ] Implement proper session management and user role verification
   - [ ] Create real user profile management system

3. **Distributor Dashboard**

   - [ ] Replace placeholder distributor data in dashboard pages
   - [ ] Implement real order assignment and fulfillment system
   - [ ] Create actual commission calculation and reporting

4. **Admin Dashboard**

   - [ ] Replace placeholder inventory and product management
   - [ ] Implement real user management and permissions
   - [ ] Create actual reporting and analytics

5. **Checkout & Payment**
   - [ ] Replace fake transaction IDs with real payment processing
   - [ ] Implement secure payment gateway integration
   - [ ] Create proper order confirmation and receipt system

### Implementation Sequence

1. **Week 1: Database & Core Services**

   - Set up production database with proper schema
   - Implement ProductService and UserService
   - Create base API endpoints for products and authentication

2. **Week 2: Order & Inventory Systems**

   - Develop OrderService and InventoryService
   - Implement cart and checkout flows
   - Create inventory management system

3. **Week 3: Distributor & Commission Systems**

   - Build CommissionService and DistributorService
   - Implement commission calculation and tracking
   - Create distributor assignment and fulfillment system

4. **Week 4: Admin & Reporting Systems**
   - Develop AdminService and ReportingService
   - Implement comprehensive admin dashboard
   - Create analytics and reporting tools

---

_Last Updated: May 2025_
