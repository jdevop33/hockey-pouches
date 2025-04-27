# Hockey Pouches Master Task List

This document serves as the single source of truth for all tasks related to the Hockey Pouches e-commerce platform.

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
   - ✅ Created custom order service with comprehensive status management
   - ✅ Implemented inventory management service with stock tracking
   - ✅ Built analytics service with reporting capabilities
   - ✅ Developed cart service with validation logic

2. **User Interface & Experience**

   - ✅ Dark mode implementation for majority of interfaces (homepage, admin dashboard, etc.)
   - ✅ Improved responsive design for most pages
   - ✅ Enhanced cart and checkout experience
   - ✅ Fixed product links directing to product detail pages
   - ✅ Fixed role-based navigation for admin, distributor, and regular users

3. **Administrative Features**

   - ✅ Fixed missing Distribution Management page
   - ✅ Fixed missing Settings page with store configuration options
   - ✅ Converted Reports page to dark mode with enhanced data visualization
   - ✅ Fixed accessibility issues in the Settings page
   - ✅ Fixed admin account navigation

4. **Copywriting & Content**

   - ✅ Updated website copy across all main pages using persuasion principles
   - ✅ Enhanced product descriptions with benefit-focused language
   - ✅ Improved checkout flow copy for premium brand positioning
   - ✅ Updated legal pages with more user-friendly language

5. **Database & Pricing**

   - ✅ Updated all product prices to standard $15 CAD
   - ✅ Created custom_pricing table for wholesale-specific pricing

6. **Database Schema Foundation**

   - ✅ Created normalized schema for products and categories tables
   - ✅ Implemented migration scripts with proper indexes and constraints
   - ✅ Added automatic timestamp updates via triggers
   - ✅ Set up seed data for initial product catalog

7. **Product Detail API Implementation**

   - ✅ Replaced mock data in `/api/products/[productId]` with database queries
   - ✅ Added caching for performance optimization
   - ✅ Implemented graceful fallback to mock data when DB unavailable
   - ✅ Created proper error handling with appropriate status codes

8. **Related Products Feature**
   - ✅ Implemented `/api/products/[productId]/related` endpoint
   - ✅ Created SQL query to find products in the same category
   - ✅ Added proper loading states in the UI with skeleton components
   - ✅ Implemented error handling and fallback content

## Priority Tasks for Next Sprint

### 1. Fix Remaining UI Issues (CRITICAL PRIORITY)

- [ ] **Product Display & Interaction**

  - [x] Fix product links on main product listing page
  - [x] Repair product ID handling in product detail pages
  - [ ] Ensure consistent product image sizing across all pages
  - [ ] Fix remaining layout issues on product detail pages for mobile devices

- [ ] **Navigation & User Flow**

  - [x] Fix admin dashboard access from account buttons
  - [x] Repair role-based navigation in header for desktop and mobile
  - [ ] Ensure breadcrumb navigation works properly on all pages
  - [ ] Fix cart indicator showing correct number of items

- [ ] **Checkout Process**
  - [ ] Complete checkout flow testing with sample orders
  - [ ] Fix payment method selection interface
  - [ ] Ensure order confirmation works properly
  - [ ] Test email notifications for orders

### 2. Authentication & User Management (HIGH PRIORITY)

- [ ] **User & Authentication Service**

  - [ ] Implement JWT or session-based authentication system
  - [ ] Create role-based authorization middleware
  - [ ] Develop secure password reset and account verification flows
  - [x] Replace placeholder authentication in all pages
    - [x] Fixed distributor dashboard pages
    - [x] Fixed admin dashboard access
    - [ ] Fix remaining user dashboard pages

- [ ] **User Profile Management**
  - [ ] Complete user profile editing functionality
  - [ ] Implement address management system
  - [ ] Add order history view with detailed status tracking
  - [ ] Create commission tracking dashboard for distributors

### 3. Order & Inventory Management (HIGH PRIORITY)

- [ ] **Order Management**

  - [ ] Complete end-to-end order processing flow
  - [ ] Implement order history with status updates
  - [ ] Create order notification system
  - [ ] Build distributor assignment workflow

- [ ] **Inventory Management**
  - [ ] Finalize inventory tracking system
  - [ ] Complete stock adjustment workflow
  - [ ] Implement low stock alerts
  - [ ] Create inventory reports for admin dashboard

### 4. Content & Asset Replacement (MEDIUM PRIORITY)

- [ ] **Replace Placeholder Images & Assets**

  - [ ] Update `/public/images/og/hockey-pouches-og.svg` with final logo
  - [ ] Replace `/public/images/og/hockey-pouches-og.png` with final OG image
  - [ ] Update `/public/images/og/hockey-logo.png` with final logo
  - [ ] Replace `/public/favicon.ico` with branded favicon
  - [ ] Optimize all product images for web performance
  - [ ] Create standardized image sizes for all product photos
  - [ ] Update any placeholder text in the application

- [ ] **Age Verification Update**
  - [ ] Update age verification to reflect Canadian requirement (19+ not 21+)
  - [ ] Ensure verification notices appear consistently across the platform
  - [ ] Add regional age verification logic based on user location

### 5. Testing & Performance (MEDIUM PRIORITY)

- [ ] **Testing & Validation**

  - [ ] Complete end-to-end testing of critical user flows
  - [ ] Test all API endpoints with realistic data
  - [ ] Verify payment processing with test transactions
  - [ ] Cross-browser testing on major platforms

- [ ] **Performance Optimization**
  - [ ] Implement image optimization and CDN configuration
  - [ ] Add proper caching strategies for static assets
  - [ ] Optimize database queries for frequently accessed data
  - [ ] Implement lazy loading for product images

### 6. Production Deployment Configuration (MEDIUM PRIORITY)

- [ ] **Configure Production Environment**

  - [x] Update Google verification code to use environment variable
  - [ ] Set up proper environment variables for all services
  - [ ] Configure production Sentry integration for error tracking
  - [ ] Enable production analytics tracking
  - [ ] Set up uptime monitoring for production

- [ ] **Payment Processing**
  - [ ] Configure production payment processor integration
  - [ ] Set up webhooks for payment status updates
  - [ ] Implement manual payment confirmation workflow
  - [ ] Test payment flows in staging environment

## Next Steps for Implementation

1. **Complete Critical UI Fixes**

   - Fix remaining navigation issues
   - Resolve product display inconsistencies
   - Test user role-based access to different sections

2. **Finalize Authentication System**

   - Complete JWT implementation
   - Test user registration and login flows
   - Implement password reset functionality

3. **Complete Order Processing**

   - Finish order creation workflow
   - Implement order status management
   - Create distributor assignment process

4. **Prepare for Production Launch**
   - Complete asset replacement
   - Configure environment variables
   - Set up monitoring and analytics
   - Perform security review

## Technical Debt to Address

1. **Code Quality**

   - Address remaining TypeScript errors
   - Improve error handling in API routes
   - Add proper validation for all user inputs

2. **Documentation**

   - Complete API documentation
   - Add comprehensive JSDocs
   - Create architectural diagrams

3. **Performance**
   - Implement image optimization
   - Add proper caching strategies
   - Optimize API responses for frequent calls

## Resources & Documentation

- **Database**: See `db/migrations/` for schema definitions
- **API Documentation**: Visit `/docs/api` in development environment
- **Testing Guide**: See `TESTING.md` for manual and automated testing procedures
- **Codebase Navigation**: See `PROJECT-STRUCTURE.md` for detailed information

---

_Last Updated: May 2025_

## End-to-End Business Management System

The platform provides a comprehensive solution with interconnected systems:

1. **Inventory Management**

   - Real-time inventory tracking across variations
   - Low stock alerts with automatic reordering suggestions
   - Supplier management with integration to purchasing workflows
   - Warehouse location tracking for efficient fulfillment

2. **Order Processing Workflow**

   - End-to-end order lifecycle management:
     - Order received → Payment verification → Inventory allocation → Distributor assignment → Fulfillment → Shipping → Delivery confirmation
   - Status tracking dashboard for all stakeholders
   - Automated notifications at each stage of processing

3. **Multi-tiered User Management**

   - Customer tier: Retail (5+ units) and wholesale (100+ units)
   - Distributor tier: Order fulfillment, commission tracking, performance metrics
   - Admin tier: Complete system management, reporting, approval workflows

4. **Commission and Payment System**

   - Automated commission calculation based on fulfilled orders
   - Distributor payout processing with payment schedule
   - Commission history and projection tools
   - Tax documentation generation for distributors

5. **Analytics and Reporting**
   - Sales analytics with trend identification
   - Inventory forecasting based on historical data
   - Distributor performance metrics
   - Financial reporting with revenue, costs, and profit tracking
   - Customer behavior analysis to optimize marketing

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

### Database Tables to Implement

1. **users**

   - id (PK)
   - email
   - password_hash
   - name
   - role (customer, distributor, admin)
   - created_at
   - updated_at

2. **products**

   - id (PK)
   - name
   - description
   - price
   - compare_at_price
   - image_url
   - category_id (FK)
   - flavor
   - strength
   - is_active
   - created_at
   - updated_at

3. **categories**

   - id (PK)
   - name
   - description
   - parent_id (FK, self-referencing)

4. **inventory_items**

   - id (PK)
   - product_id (FK)
   - location_id (FK)
   - quantity
   - sku
   - created_at
   - updated_at

5. **locations**

   - id (PK)
   - name
   - address
   - is_active

6. **orders**

   - id (PK)
   - user_id (FK)
   - status
   - total_amount
   - distributor_id (FK, optional)
   - commission_amount
   - shipping_address
   - payment_method
   - created_at
   - updated_at

7. **order_items**

   - id (PK)
   - order_id (FK)
   - product_id (FK)
   - quantity
   - price_at_purchase
   - subtotal

8. **wholesale_applications**

   - id (PK)
   - user_id (FK)
   - company_name
   - tax_id
   - status
   - submitted_at
   - approved_at
   - rejected_at

9. **custom_pricing**

   - id (PK)
   - user_id (FK)
   - product_id (FK)
   - price
   - created_at
   - updated_at

10. **commissions**
    - id (PK)
    - order_id (FK)
    - distributor_id (FK)
    - amount
    - status
    - payout_date

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

5. **B2B Portal Enhancement**
   - Dedicated wholesale buyer interface
   - Bulk ordering tools
   - Custom pricing tiers for different wholesale volumes

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

### SQL Migration Guide for Neon PostgreSQL

When running SQL scripts in the Neon console, comments and multi-statement scripts may cause problems:

1. **Comment Formatting**: Neon's SQL editor sometimes misinterprets certain comment styles
2. **Multiple Statements**: Running multiple statements at once can be problematic
3. **Transaction Management**: Neon may handle transactions differently than expected

#### Method 1: Use the Migration Script (Recommended)

The project includes `scripts/run-migrations.js` which handles migrations properly:

1. Install dependencies: `npm install pg dotenv`
2. Set your DATABASE_URL in `.env.local`:

```bash
DATABASE_URL=postgres://user:password@your-neon-host/dbname
```

3. Run: `node scripts/run-migrations.js`

This script:

- Automatically tracks applied migrations
- Runs migrations in transaction blocks (rollback on error)
- Handles comments correctly
- Executes migrations in alphabetical order

#### Method 2: Modified SQL in Neon Console

When using Neon's SQL editor directly:

1. **For Comments**:

   - Use `--` single-line comments instead of `/* */` multi-line comments
   - Avoid trailing comments on the same line as SQL statements

2. **Split Complex Scripts**:

   - Run one statement at a time
   - Separate CREATE TABLE, CREATE INDEX, etc. into individual runs

3. **Handling Transactions**:
   - Run BEGIN/COMMIT explicitly for multi-statement operations

#### Method 3: Using psql CLI with Neon

Connect directly with psql using your Neon connection string:

```bash
psql postgresql://user:password@your-neon-host/dbname
```

Then either:

- Run statements interactively
- Execute a script file: `\i path/to/script.sql`

This method handles comments and multi-statements properly.

### Database Schema Validation

After running migrations, verify your schema:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- View table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'table_name_here';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'table_name_here';
```

### Database Connection Example

```typescript
// Example implementation for app/lib/db.ts
import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';

let pool: Pool;
let sql: any;

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

// Initialize connection pool
const initializePool = () => {
  try {
    neonConfig.fetchConnectionCache = true;
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    sql = neon(process.env.POSTGRES_URL);
    console.log('Database connection initialized');
    return { pool, sql };
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
};

// Get or initialize pool
export function getDb() {
  if (!pool || !sql) {
    const db = initializePool();
    pool = db.pool;
    sql = db.sql;
  }
  return { pool, sql };
}
```

### Service Implementation Example

```typescript
// Example ProductService implementation
import { getDb } from '../db';

export class ProductService {
  async findAll({ page = 1, limit = 20, category, search, minPrice, maxPrice }) {
    const { sql } = getDb();

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (minPrice !== undefined) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY p.id LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Get total count for pagination
    const countQuery = query
      .replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)')
      .split('ORDER BY')[0];

    const [products, countResult] = await Promise.all([
      sql.query(query, params),
      sql.query(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      products: products.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Other methods...
}
```

---

_Last Updated: May 2025_

## Next Steps: API Implementation

After completing the database schema migrations, our next focus should be:

1. **Database Connection**

   - Configure production database connection with proper pooling
   - Implement database service layer for all API endpoints

2. **API Development**

   - Replace mock data with real database queries
   - Implement full CRUD operations for products
   - Add proper validation and error handling

3. **Payment Integration**

   - Implement temporary email-based manual payment workflow
   - Prepare for future integration with Stripe once approved

4. **Product Management**
   - Set up product creation and management in admin dashboard
   - Implement product image upload and storage
   - Add support for product variations management
