# Hockey Pouches Production Tasks - Updated

## Completed Tasks

1. **Backend Architecture**

   - ✅ Created custom product service
   - ✅ Implemented commission calculation and payout service
   - ✅ Added wholesale application approval workflow
   - ✅ Implemented wholesale order validation with minimum units check

2. **Admin Dashboard**

   - ✅ Fixed missing Dashboard pages
   - ✅ Converted all admin pages to dark mode
   - ✅ Added proper role-based access control

3. **User Experience Improvements**
   - ✅ Enhanced product detail page with persuasive copywriting
   - ✅ Updated cart and checkout flow with premium language
   - ✅ Improved user profile and account pages with brand-consistent copy
   - ✅ Enhanced all main website pages with customer-focused messaging

## In Progress Tasks

1. **Mobile UI Optimization**

   - Ensure all interfaces are responsive on mobile devices
   - Fix touch interactions for mobile users
   - Optimize images for mobile bandwidth

2. **Dark Mode Completion**

   - Complete dark mode implementation for user dashboard
   - Complete dark mode for distributor dashboard
   - Finalize checkout flow dark mode styling

3. **Performance Improvements**

   - Implement proper image optimization
   - Add caching for frequently accessed data
   - Optimize expensive database queries

4. **Testing & Validation**
   - Perform E2E testing of critical user flows
   - Validate commission calculations
   - Test wholesale ordering with minimum requirements

## Production Deployment Checklist

1. **Pre-Deployment Tasks**

   - Update all environment variables
   - Verify database connection strings
   - Check payment processor integration

2. **Deployment Process**

   - Run database migrations
   - Deploy backend services
   - Deploy frontend assets
   - Verify static assets are properly cached

3. **Post-Deployment Verification**
   - Verify all API endpoints are working
   - Test user authentication flows
   - Validate order processing end-to-end
   - Check commission calculations
   - Verify analytics tracking

## Architecture Documentation

### Service-Based Architecture

We've implemented a service-based architecture to replace the Medusa.js dependency:

1. **ProductService** - Handles all product-related operations:

   - Product retrieval with variations
   - Product creation and updates
   - Wholesale order validation

2. **CommissionService** - Manages commission-related functionality:

   - Calculates referral commissions
   - Processes distributor fulfillment commissions
   - Handles commission payouts
   - Provides commission statistics

3. **WholesaleService** - Manages wholesale buyer functionality:
   - Application processing
   - Minimum order requirements validation
   - Wholesale-specific pricing

### Database Schema Updates

We've added several new tables to support our custom implementation:

1. **wholesale_applications** - Stores wholesale buyer applications
2. **payouts** - Tracks commission payout batches
3. **notifications** - System notifications for users

### API Endpoints

1. **Product Endpoints**

   - `GET /api/products` - List products with filtering and pagination
   - `GET /api/products/[productId]` - Get a specific product with variations

2. **Wholesale Endpoints**

   - `POST /api/wholesale/apply` - Submit wholesale application
   - `PATCH /api/admin/wholesale/applications/[customerId]` - Approve/reject applications

3. **Commission Endpoints**
   - `POST /api/orders/[orderId]/calculate-commission` - Calculate commission for order
   - `POST /api/admin/commissions/payout` - Process commission payouts

## Next Steps

1. Complete mobile optimization
2. Finish dark mode implementation for all pages
3. Implement performance optimizations
4. Run final testing
5. Deploy to production environment

# API Development & Database Integration Plan

## Overview

This document outlines the comprehensive plan to transition from mock data to production-ready database operations across the Hockey Pouches platform. The goal is to build a robust backend that supports all required functionality while maintaining high performance, security, and scalability.

## Current Status Assessment

The codebase currently relies heavily on mock data and placeholder implementations:

1. **Mock Database**: Using mockPool and mockSql in app/lib/db.ts
2. **Mock Product Data**: Hardcoded product information in app/api/mockData.ts
3. **Placeholder Authentication**: Dummy authentication checks across multiple pages
4. **Mock API Responses**: Several API routes returning hardcoded responses rather than database queries

## Implementation Plan

### Phase 1: Database Infrastructure (Week 1)

#### 1. Database Schema & Migration

- [ ] Design complete normalized database schema (PostgreSQL)
- [ ] Create migration scripts for all tables
- [ ] Implement proper indexes for performance optimization
- [ ] Set up database roles and permissions for security

#### 2. Database Connection Layer

- [ ] Replace mockPool with production connection pool
- [ ] Implement connection error handling and retry logic
- [ ] Add query logging and performance monitoring
- [ ] Create database utility functions for common operations

#### 3. Core Services Implementation

- [ ] Build base Service class with common CRUD operations
- [ ] Implement UserService for authentication and user management
- [ ] Create ProductService for product catalog operations
- [ ] Develop CategoryService for product categorization

### Phase 2: API Routes Refactoring (Week 2)

#### 1. Authentication & User APIs

- [ ] Implement JWT-based authentication
- [ ] Create login, registration, and password reset endpoints
- [ ] Build user profile management endpoints
- [ ] Add role-based authorization middleware

#### 2. Product & Inventory APIs

- [ ] Replace mock product data with database queries
- [ ] Implement product search, filtering, and pagination
- [ ] Create inventory tracking and management endpoints
- [ ] Build product variation and pricing endpoints

#### 3. Cart & Order APIs

- [ ] Implement shopping cart persistence
- [ ] Create order processing workflow
- [ ] Build order status tracking endpoints
- [ ] Develop address validation and management

### Phase 3: Advanced Features (Week 3)

#### 1. Distributor & Commission System

- [ ] Implement distributor assignment logic
- [ ] Create commission calculation engine
- [ ] Build payout processing and tracking
- [ ] Develop distributor performance analytics

#### 2. Wholesale System

- [ ] Build wholesale application processing
- [ ] Implement custom pricing for wholesale accounts
- [ ] Create wholesale order validation
- [ ] Develop wholesale customer management

#### 3. Admin Management System

- [ ] Implement user management for admins
- [ ] Create product and inventory management
- [ ] Build reporting and analytics dashboard
- [ ] Develop system configuration management

### Phase 4: Testing & Optimization (Week 4)

#### 1. Comprehensive Testing

- [ ] Create unit tests for all services
- [ ] Implement integration tests for API endpoints
- [ ] Build end-to-end tests for critical user flows
- [ ] Perform security testing and vulnerability assessment

#### 2. Performance Optimization

- [ ] Implement query optimization
- [ ] Add caching for frequently accessed data
- [ ] Create database connection pooling strategies
- [ ] Optimize image and asset delivery

#### 3. Documentation & Deployment

- [ ] Create API documentation with Swagger/OpenAPI
- [ ] Build deployment pipeline with database migrations
- [ ] Implement monitoring and alerting
- [ ] Create backup and disaster recovery procedures

## API Endpoints to Implement

### User & Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh authentication token
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Products & Catalog

- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` (Admin) - Create new product
- `PUT /api/products/:id` (Admin) - Update product
- `GET /api/categories` - List product categories

### Orders & Checkout

- `GET /api/cart` - Get current cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove cart item
- `POST /api/checkout` - Process checkout
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details

### Distributor Operations

- `GET /api/distributor/orders` - List assigned orders
- `GET /api/distributor/orders/:id` - Get order details
- `POST /api/distributor/orders/:id/fulfill` - Mark order as fulfilled
- `GET /api/distributor/commissions` - List earned commissions

### Admin Operations

- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/inventory` - List inventory
- `PUT /api/admin/inventory/:id` - Update inventory

## Database Tables to Implement

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

## Technical Implementation Details

### Database Connection

```typescript
// Replace in app/lib/db.ts
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

### Service Example

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

## Product Detail Page Implementation (Priority)

### Current Issues

- The product detail page (`app/products/[id]/page.tsx`) relies on mock data
- SocialShare component has type incompatibility issues with description prop
- Related products section uses placeholder images
- No real database integration for product details

### Detailed Tasks

1. **API Endpoint Refactoring**

   - [ ] Update `/api/products/[productId]/route.ts` to use real database
   - [ ] Implement proper error handling with status codes
   - [ ] Add validation for product ID parameter
   - [ ] Create response cache for frequently accessed products

2. **Product Detail Page Enhancement**

   - [ ] Fix type compatibility with SocialShare component
   - [ ] Implement proper loading states with skeleton UI
   - [ ] Create error recovery mechanisms
   - [ ] Add analytics tracking for product views

3. **Related Products Implementation**

   - [ ] Create database query to find related products by category
   - [ ] Implement API endpoint for fetching related products
   - [ ] Replace placeholder images with actual product images
   - [ ] Add proper product navigation between related items

4. **Database Implementation Tasks**

   ```sql
   -- Example SQL query for product detail endpoint
   SELECT
     p.*,
     c.name as category_name,
     c.description as category_description
   FROM products p
   LEFT JOIN categories c ON p.category_id = c.id
   WHERE p.id = $1 AND p.is_active = true
   ```

   ```sql
   -- Example SQL query for related products
   SELECT p.*
   FROM products p
   WHERE p.category_id = (
     SELECT category_id FROM products WHERE id = $1
   )
   AND p.id != $1
   AND p.is_active = true
   LIMIT 4
   ```

5. **TypeScript Interface Updates**
   ```typescript
   // Update Product interface to match database schema
   interface Product {
     id: number;
     name: string;
     description: string | null;
     flavor: string | null;
     strength: number | null;
     price: number;
     compare_at_price: number | null;
     image_url: string | null;
     category_id: number;
     category_name?: string; // Joined from categories table
     is_active: boolean;
     created_at: string;
     updated_at: string;
   }
   ```
