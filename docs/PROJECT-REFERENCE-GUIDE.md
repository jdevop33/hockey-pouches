# Hockey Pouches Project Reference Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Status](#project-status)
3. [Technical Stack](#technical-stack)
4. [Design Guidelines](#design-guidelines)
   - [Brand Style Guide](#brand-style-guide)
   - [UI Design Principles](#ui-design-principles)
   - [Dark Mode Implementation](#dark-mode-implementation)
5. [Copywriting Guidelines](#copywriting-guidelines)
   - [Persuasion Principles](#persuasion-principles)
   - [Writing Style](#writing-style)
6. [Product Naming Conventions](#product-naming-conventions)
7. [Implementation Details](#implementation-details)
   - [Authentication System](#authentication-system)
   - [Email Service](#email-service)
   - [State Management](#state-management)
8. [Testing Procedures](#testing-procedures)
9. [Production Readiness](#production-readiness)
10. [Priority Tasks](#priority-tasks)

## Project Overview

Hockey Pouches is a premium e-commerce platform for hockey equipment storage solutions that supports multiple user roles (customers, distributors, admins), features a custom backend implementation, and includes specialized functionality for wholesale buyers, commission tracking, and order fulfillment.

### Core Features

- **E-commerce:** Product browsing, cart, checkout (Credit Card, E-Transfer, potential BTC).
- **MLM System:**
  - **Retail Customer/Referrers:** Can buy products and earn 5% commission via referral code/link.
  - **Distributors:** Regional inventory management (Vancouver, Calgary, Edmonton, Toronto) and order fulfillment.
  - **Wholesale Buyers:** Bulk purchasing with referral requirement.
- **Admin Management:** Full oversight of users, products, inventory, orders (approval/assignment/verification), commissions, finances, and task management.

## Project Status

### Completed Initiatives

1. **State Management Implementation**

   - ✅ Set up Zustand store with proper TypeScript support
   - ✅ Implemented base store with common functionality
   - ✅ Created UI store for theme and notifications
   - ✅ Implemented cart store with persistence
   - ✅ Added product store with filtering capabilities
   - ✅ Created auth store with token management
   - ✅ Set up store provider with proper hydration handling

2. **Custom Backend Implementation**

   - ✅ Removed legacy dependencies
   - ✅ Created custom product service
   - ✅ Implemented commission calculation
   - ✅ Added wholesale workflow
   - ✅ Created order service
   - ✅ Implemented inventory management
   - ✅ Built analytics service
   - ✅ Developed cart service

3. **User Interface & Experience**

   - ✅ Dark mode implementation for majority of interfaces
   - ✅ Improved responsive design for most pages
   - ✅ Enhanced cart and checkout experience
   - ✅ Fixed product links directing to product detail pages
   - ✅ Fixed role-based navigation for admin, distributor, and regular users
   - ✅ Fixed cart indicator in navigation bar to show the actual count of items
   - ✅ Created a reusable PaymentMethodSelector component
   - ✅ Enhanced payment method selection interface with Interac e-Transfer logo

4. **Database & Schema**
   - ✅ Updated all product prices to standard $15 CAD
   - ✅ Created custom_pricing table for wholesale-specific pricing
   - ✅ Created normalized schema for products and categories tables
   - ✅ Implemented migration scripts with proper indexes and constraints
   - ✅ Added automatic timestamp updates via triggers
   - ✅ Set up seed data for initial product catalog

### Priority Tasks for Next Sprint

1. **Enhanced State Management** (HIGH PRIORITY)

   - [ ] Complete store hydration with Next.js SSR
   - [ ] Add type-safe action creators
   - [ ] Implement store slicing for code splitting

2. **Next.js App Router Integration** (HIGH PRIORITY)

   - [ ] Convert applicable components to React Server Components
   - [ ] Implement proper data fetching patterns
   - [ ] Add streaming and suspense boundaries
   - [ ] Set up proper error boundaries

3. **Performance Optimization** (HIGH PRIORITY)
   - [ ] Implement selective subscription patterns
   - [ ] Add memoization for computed values
   - [ ] Optimize store updates
   - [ ] Add proper TypeScript inference

## Technical Stack

- **Framework**: Next.js `14.2.28` (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript `~5.0.0`
- **Database**: Neon (PostgreSQL) via `@neondatabase/serverless`
- **Auth**: `bcrypt` for hashing, `jsonwebtoken` for tokens
- **Analytics**: Google Analytics (GA4), Microsoft Clarity, Vercel Analytics
- **State Management**: Zustand with proper TypeScript support
- **Email Service**: Mailgun via Nodemailer

## Design Guidelines

### Brand Style Guide

#### Color Palette

**Primary Colors**

- **Gold**: `#d4af37` (--primary-gold: 212, 175, 55)
  - Accent Gold: `#ffd700` (--accent-gold: 255, 215, 0)
  - Luxury Gold: `#b8860b` (--luxury-gold: 184, 134, 11)

**Dark Theme Colors**

- **Background**: `#05050f` (--background-rgb: 5, 5, 15)
- **Dark Surface**: `#18181b` (--brand-surface)
- **Dark Variants**:
  - Dark-500: `#12121a` (Main dark background)
  - Dark-600: `#0d0d12`
  - Dark-700: `#08080a`
  - Dark-800: `#050507`
  - Dark-900: `#020203`

**Status Colors**

- **Success**: `#05CE91` (success-green)
- **Warning**: `#FF9900` (warning-amber)
- **Alert**: `#FF3B30` (alert-red)

#### Typography

**Font Families**

- **Main/Sans**: 'Inter', system-ui, sans-serif
- **Headings**: 'Montserrat', 'Sora', system-ui
- **Body**: 'Lato', 'Inter', system-ui
- **Monospace**: 'JetBrains Mono', monospace

**Type Scale**

- **H1**: 3rem, line-height: 3.375rem, letter-spacing: -0.5px, font-weight: 700
- **H2**: 2.25rem, line-height: 2.75rem, letter-spacing: -0.3px, font-weight: 600
- **H3**: 1.75rem, line-height: 2.25rem, letter-spacing: -0.2px, font-weight: 500
- **H4**: 1.3125rem, line-height: 1.75rem, font-weight: 500
- **Subtitle**: 1.125rem, line-height: 1.625rem, font-weight: 400, letter-spacing: 0.2px
- **Body**: 1rem, line-height: 1.5rem, font-weight: 400
- **Caption**: 0.875rem, line-height: 1.25rem, font-weight: 300, letter-spacing: 0.1px
- **Legal**: 0.75rem, line-height: 1rem, font-weight: 300

#### Button Variants

- **Primary/Default**: `bg-gold-500 text-black font-semibold hover:bg-gold-600 shadow-gold-sm hover:shadow-gold btn-gold-contrast`
- **Secondary**: `bg-secondary-200 text-secondary-900 hover:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-50 dark:hover:bg-secondary-700`
- **Outline**: `border border-gold-500/50 bg-transparent hover:bg-gold-500/10 text-gold-500`
- **Ghost**: `hover:bg-gold-500/10 text-gold-500 hover:text-gold-600`
- **Link**: `text-gold-500 underline-offset-4 hover:underline`
- **Gold**: `bg-gold-500 text-black font-bold hover:bg-gold-600 border border-gold-600 hover:shadow-gold btn-gold-contrast`

#### Box Shadows

- **Gold**: `shadow-gold` - `0 0 10px rgba(212, 175, 55, 0.3)`
- **Gold Small**: `shadow-gold-sm` - `0 0 5px rgba(212, 175, 55, 0.2)`
- **Gold Large**: `shadow-gold-lg` - `0 0 15px rgba(212, 175, 55, 0.4)`
- **Gold Inner**: `shadow-gold-inner` - `inset 0 0 5px rgba(212, 175, 55, 0.2)`
- **Gold Glow**: `shadow-gold-glow` - `0 0 20px rgba(255, 215, 0, 0.4)`

### UI Design Principles

Based on Refactoring UI principles:

1. **Feature First, Not Layout**:

   - Begin design by focusing on core functionality, not the overall page shell.

2. **Clear Hierarchy**:

   - Use size, font weight, and color/contrast to establish visual hierarchy.
   - Limit to 2-3 text colors and 2 font weights for most UI text.
   - Emphasize by de-emphasizing surrounding elements.

3. **Whitespace and Layout**:

   - Start with more whitespace than you think you need.
   - Use a consistent spacing system with noticeable, non-linear jumps.
   - Ensure space between distinct groups is larger than space within a group.
   - Elements should only be as wide as their content requires.

4. **Typography**:

   - Use a defined type scale (e.g., 12, 14, 16, 18, 20, 24, 30, 36px).
   - Adjust line height based on font size and line length.
   - Default to left-alignment for most text.

5. **Color Usage**:

   - Use HSL for intuitive color management.
   - Build a comprehensive palette with 8-10 greys and 5-10 shades of primary colors.
   - Ensure accessibility with proper contrast ratios.
   - Don't rely solely on color to convey information.

6. **Creating Depth**:
   - Simulate a light source (subtle).
   - Use shadows for elevation and focus.
   - Consider two-part shadows for realism.
   - Create depth with overlapping layers.

### Dark Mode Implementation

The application is being standardized on a dark mode theme with gold accents:

#### Background Colors

- Primary Background: `bg-dark-500` (#12121a)
- Secondary Background: `bg-dark-600` (#0d0d12)
- Tertiary Background: `bg-dark-700` (#08080a)
- Card/Element Background: `bg-dark-600` (#0d0d12) or `bg-dark-700` (#08080a)

#### Text Colors

- Primary Text: `text-white`
- Secondary Text: `text-gray-300` or `text-gray-400`
- Accent Text: `text-gold-500` (#d4af37)
- Success Text: `text-green-400`
- Warning Text: `text-yellow-400`
- Error Text: `text-red-300` or `alert-red` (#FF3B30)

#### Border Colors

- Primary Border: `border-gold-500/10` or `border-gold-500/20`
- Secondary Border: `border-gray-700`
- Focus Border: `border-gold-500`

#### Button Colors

- Primary Button: `bg-gold-500 text-dark-900`
- Secondary Button: `bg-transparent border border-gold-500 text-gold-500`
- Hover States: `hover:bg-gold-400` (for primary), `hover:bg-gold-500 hover:text-dark-900` (for secondary)

## Copywriting Guidelines

### Persuasion Principles

Based on Cialdini's principles of influence:

1. **Reciprocation**

   - Offer value first before asking for a sale or commitment.
   - Frame offers as genuine gifts or acts of goodwill.
   - Use language implying debt or generosity.

2. **Commitment and Consistency**

   - Ask for small, easy commitments first.
   - Encourage active participation and public commitments.
   - Frame requests to align with the target audience's existing values.

3. **Social Proof**

   - Feature testimonials and reviews, especially from similar users.
   - Show user counts, best-seller labels, and popularity indicators.
   - Provide detailed case studies of successful product use.

4. **Liking**

   - Build rapport with a friendly, conversational brand voice.
   - Emphasize similarity with the audience.
   - Associate the brand with positive experiences or people.

5. **Authority**

   - Cite experts and display credentials.
   - Use symbols of authority in visuals or copy.
   - Provide genuinely useful, expert-level information.

6. **Scarcity**
   - Highlight limited availability or time-sensitive offers.
   - Frame benefits in terms of potential loss.
   - Emphasize when something has just become scarce.

### Writing Style

Based on Sin and Syntax principles:

1. **Word Choice**

   - Choose precise words that exactly express your meaning.
   - Prefer concrete, specific words over abstract, general ones.
   - Build descriptions around powerful, specific nouns.

2. **Verb Usage**

   - Prefer action verbs over forms of "to be" or linking verbs.
   - Generally use active voice for directness and clarity.
   - Don't settle for weak/generic verbs.

3. **Sentence Structure**

   - Maintain a clear subject-predicate core.
   - Mix simple, compound, and complex sentences.
   - Use parallelism for similar grammatical structures.
   - Create clear connections between ideas.

4. **Style and Voice**
   - Aim for clarity without sacrificing richness.
   - Write to your reader with an authentic tone.
   - Develop a distinctive, consistent voice.
   - Show, don't tell, using concrete details.

## Product Naming Conventions

Products should follow this naming format in the database:

```
[Brand] [Flavor] ([Strength]mg)
```

Examples:

- `PUXX Mint (22mg)`
- `PUXX Watermelon (16mg)`
- `PUXX Apple Mint (12mg)`

Image files should use kebab-case:

```
brand-flavor-strength.png
```

Examples:

- `puxx-mint-22mg.png`
- `puxx-watermelon-16mg.png`

For database fields:

- `name`: Use the format `[Brand] [Flavor] ([Strength]mg)`
- `description`: Include flavor description and strength information
- `image_url`: Use the path `/images/products/brand-flavor-strength.png`
- `flavor`: Just the flavor name (e.g., "Mint", "Watermelon")
- `strength`: Numeric value only, without "mg" (e.g., 22, 16, 12)

## Implementation Details

### Authentication System

The authentication system uses JWT tokens for secure API access:

1. **Login/Registration**: Users authenticate via `/api/auth/login` or `/api/auth/register`
2. **Token Storage**: JWT tokens are stored in localStorage via AuthContext
3. **API Authentication**: All protected routes use the centralized auth utility in `/app/lib/auth.ts`
4. **Role-Based Access**: Different user roles (Admin, Distributor, Retail Customer, Wholesale Buyer) have different access levels

To make authenticated requests to the API, include the JWT token in the Authorization header:

```javascript
const response = await fetch('/api/users/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Email Service

The application uses Mailgun for email delivery through Nodemailer. The system supports:

1. **Contact Form Submissions**: Emails sent to the store admin with user messages
2. **Order Confirmations**: Emails sent with order details, items, pricing, and shipping address
3. **Shipping Notifications**: Emails sent with tracking information

Implementation files:

- `app/lib/email.ts`: Core email sending functionality
- `app/lib/email-templates.ts`: HTML email templates and styling
- `app/api/contact/route.ts`: API endpoint for contact form submissions
- `app/api/orders/route.ts`: Order creation includes confirmation emails

### State Management

The project uses Zustand with TypeScript for state management:

```typescript
// Base store with common functionality
interface BaseState {
  isLoading: boolean;
  error: string | null;
  // ... other common state
}

// UI Store for theme and notifications
interface UIState extends BaseState {
  theme: 'light' | 'dark';
  notifications: Notification[];
  // ... UI actions
}

// Cart Store for shopping functionality
interface CartState extends BaseState {
  items: CartItem[];
  total: number;
  // ... cart actions
}

// Product Store for catalog management
interface ProductState extends BaseState {
  products: Product[];
  filters: ProductFilters;
  // ... product actions
}

// Auth Store for user management
interface AuthState extends BaseState {
  user: User | null;
  tokens: Tokens;
  // ... auth actions
}
```

## Testing Procedures

### Automated Testing

1. **API Testing**

   ```bash
   npm run test:api
   ```

2. **Email Notification Testing**

   ```bash
   npm run test:emails
   npm run test:emails -- etransfer
   npm run test:emails -- btc
   npm run test:emails -- credit-card
   ```

3. **Checkout Flow Testing**
   ```bash
   npm run test:checkout
   npm run test:checkout -- etransfer
   npm run test:checkout -- btc
   npm run test:checkout -- credit-card
   ```

### Manual Testing Checklist

1. **User Authentication**

   - User registration, login, logout
   - Password reset functionality
   - Authentication persistence
   - Protected routes security

2. **Product Browsing**

   - Products listing and filtering
   - Product search and sorting
   - Product details page
   - Product images loading

3. **Shopping Cart**

   - Adding, updating, removing products
   - Cart persistence
   - Total calculation

4. **Checkout Process**

   - Form validation
   - Address entry
   - Order summary
   - Order confirmation
   - Database storage

5. **Admin Dashboard**

   - Order management
   - Product management
   - User management

6. **Distributor Dashboard**

   - Order assignment
   - Order fulfillment
   - Tracking information

7. **Referral System**

   - Referral code generation
   - Commission calculation
   - Referral statistics

8. **Mobile Responsiveness**
   - All pages on mobile devices
   - Forms and interactive elements
   - Navigation and layout

## Production Readiness

### Authentication & Security

- [ ] Add token refresh mechanism
- [ ] Add token blacklisting for logout
- [ ] Add proper role validation middleware
- [ ] Complete CSRF token validation
- [ ] Extend rate limiting to use Redis
- [ ] Create password reset flow

### Payment Processing

- [ ] Complete Stripe integration
- [ ] Add webhook handling
- [ ] Complete manual payment methods
- [ ] Add receipt generation
- [ ] Implement refund/return processing
- [ ] Add tax management

### Email Notifications

- [ ] Add retry mechanism
- [ ] Implement email queue system
- [ ] Add more email templates
- [ ] Create email verification flow

### Admin Features

- [ ] Complete order modification system
- [ ] Add reporting system
- [ ] Enhance inventory management
- [ ] Improve wholesale management
- [ ] Develop task management

### Performance Optimization

- [ ] Implement Redis caching
- [ ] Optimize images
- [ ] Implement proper code splitting
- [ ] Optimize database queries

## Priority Tasks

1. **Security & Authentication**

   - Complete JWT implementation
   - Add CSRF protection
   - Implement rate limiting

2. **Payment Processing**

   - Finalize Stripe integration
   - Complete manual payment methods
   - Add receipt generation

3. **Data Protection & Privacy**

   - Implement data encryption
   - Add GDPR/CCPA compliance

4. **Core Admin Features**

   - Finish order management
   - Complete reporting system
   - Enhance inventory tracking

5. **Testing Implementation**

   - Add more test coverage
   - Implement load testing
   - Add E2E testing

6. **Performance Optimization**
   - Implement caching
   - Optimize images
   - Add code splitting
