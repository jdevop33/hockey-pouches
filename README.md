# Hockey Puxx - E-commerce & MLM Platform

A Next.js e-commerce website for Hockey Puxx nicotine pouches, targeting the Canadian market. This platform includes standard e-commerce functionality along with a multi-level marketing (MLM) system for referrals and distributors, plus comprehensive admin management tools.

Built with Next.js (`14.2.28`) and Tailwind CSS v4.

## Core Features

- **E-commerce:** Product browsing, cart, checkout (Credit Card, E-Transfer, potential BTC).
- **MLM System:**
  - **Retail Customer/Referrers:** Can buy products and earn 5% commission via referral code/link.
  - **Distributors:** Regional inventory management (Vancouver, Calgary, Edmonton, Toronto) and order fulfillment.
  - **Wholesale Buyers:** Bulk purchasing with referral requirement.
- **Admin Management:** Full oversight of users, products, inventory, orders (approval/assignment/verification), commissions, finances, and task management.

## Tech Stack

- **Framework**: Next.js `14.2.28` (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript `~5.0.0`
- **Database**: Neon (PostgreSQL) via `@neondatabase/serverless`
- **Auth**: `bcrypt` for hashing, `jsonwebtoken` for tokens
- **Analytics**: Google Analytics (GA4), Microsoft Clarity, Vercel Analytics

## Project Status (Apr 23, 2025)

- **Phase 1: Scaffolding (Complete)**
  - Full project structure (API routes, Frontend pages) created based on scope.
  - Neon DB connection utility (`/app/lib/db.ts`) established.
  - `users` table created in Neon DB.
  - Basic Register/Login API implemented (with DB checks, hashing).
  - Basic Auth Context (`/app/context/AuthContext.tsx`) implemented using localStorage.
  - Layout updated for basic Login/Logout display.
  - Vercel build is stable.
- **Phase 2: Implementation (In Progress)**
  - Authentication flow solidified with centralized auth utility.
  - API routes secured with JWT verification.
  - Shared type definitions implemented.
  - User, product, order, and commission APIs implemented.
  - Admin routes secured with role-based access control.

## Project Structure (Expanded)

- `/app`: Next.js App Router structure
  - `/api`: Backend API routes (Auth, Users, Products, Orders, etc. + Admin/Distributor)
  - `/components`: Reusable React components (Layout, UI, Cart)
  - `/context`: React Context providers (AuthContext, CartContext)
  - `/lib`: Utility functions (e.g., `db.ts`, `auth.ts`)
  - `/types`: Shared TypeScript type definitions
  - `/dashboard`: Retail Customer dashboard pages.
  - `/distributor/dashboard`: Distributor dashboard pages.
  - `/admin/dashboard`: Admin dashboard pages.
  - `/data`: Static data (initial `products.ts`).
  - `/(public pages)`: Root pages (`page.tsx`, `products/page.tsx`, etc.)
  - `/_components`: Root-level client components (analytics, etc.).
- `/public`: Static assets.
- `/scripts`: Utility scripts.
- `.github/workflows`: Contains `neon_workflow.yml` for automatic preview DB branches (if added).
- Config files: `README.md`, `package.json`, `tsconfig.json`, `next.config.cjs`, `.env.local`

## Getting Started

### Prerequisites

- Node.js `~18.17.0` or later
- npm or yarn
- Access to the Neon project & Vercel project.

### Installation

1. Clone the repository.
2. Install dependencies: `npm install`
3. **Environment Variables:** Create `.env.local` file (copy from `.env.example` if available or use structure below) and populate with actual values from Vercel / Neon / Service accounts. **Ensure Vercel project environment variables are also set.**

   ```dotenv
   # General Public Vars
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_CONTACT_EMAIL=info@nicotinetins.com
   NEXT_PUBLIC_SITE_NAME="Hockey Puxx (Dev)"
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

   # Database (From Neon/Vercel Integration)
   POSTGRES_URL="postgres://..."

   # Authentication (Generate a strong secret!)
   JWT_SECRET="YOUR_STRONG_RANDOM_JWT_SECRET_HERE"

   # Add Payment Gateway Keys etc. as needed
   ```

4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

## Authentication System

The authentication system uses JWT tokens for secure API access:

1. **Login/Registration**: Users authenticate via `/api/auth/login` or `/api/auth/register`
2. **Token Storage**: JWT tokens are stored in localStorage via AuthContext
3. **API Authentication**: All protected routes use the centralized auth utility in `/app/lib/auth.ts`
4. **Role-Based Access**: Different user roles (Admin, Distributor, Retail Customer, Wholesale Buyer) have different access levels

### Making Authenticated Requests

To make authenticated requests to the API, include the JWT token in the Authorization header:

```javascript
const response = await fetch('/api/users/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## API Routes

### Public Routes

- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/products` - List all active products
- `/api/products/[productId]` - Get specific product details

### Protected User Routes

- `/api/users/me` - Get current user profile
- `/api/users/me/commissions` - Get user's commissions
- `/api/users/me/tasks` - Get user's assigned tasks
- `/api/orders/me` - Get user's orders
- `/api/orders/me/[orderId]` - Get specific order details

### Admin Routes

- `/api/admin/users` - Manage users
- `/api/admin/products` - Manage products
- `/api/admin/orders` - Manage orders
- `/api/admin/commissions` - Manage commissions
- `/api/admin/tasks` - Manage tasks
- `/api/admin/inventory` - Manage inventory

### Distributor Routes

- `/api/distributor/orders` - View assigned orders
- `/api/distributor/orders/[orderId]/fulfill` - Mark order as fulfilled

## Development Workflow

1. **Implementation:**
   - Continue implementing features based on `// TODO:` comments.
   - Focus on frontend components and pages.
   - Implement remaining API routes.
   - Build out Admin/Distributor dashboards.
2. **Testing:** Add tests for API routes and components.
3. **Commit & Push:** Use conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
4. **Deploy:** Use `npm run deploy` or Vercel dashboard.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run deploy` - Deploy to Vercel
- `npm run git:push` - Push to GitHub

## Deployment

Deployed on Vercel. Automatic preview branches created via GitHub Actions workflow (`.github/workflows/neon_workflow.yml`).

## Production Deployment Checklist

Before deploying to production, ensure that you complete the following tasks:

### 1. Database and API Setup

- [ ] Configure production database connection in Vercel environment variables
- [x] Remove all mock data implementations (completed)
- [x] Ensure all API endpoints use proper database queries (completed)
- [x] Validate database schema is complete and has proper indexes
- [ ] Create database backup strategy

### 2. Authentication and Security

- [ ] Implement JWT-based authentication system with proper role-based access
  - [x] Replaced placeholder authentication in distributor dashboard
  - [ ] Replace placeholder authentication in admin dashboard
- [ ] Set up CSRF protection for all forms
- [ ] Add rate limiting to prevent abuse
- [ ] Configure proper CORS settings
- [ ] Enable audit logging for security events

### 3. Assets and Content

- [ ] Replace all placeholder images:
  - [ ] Update `/public/images/og/hockey-pouches-og.svg` with final logo
  - [ ] Replace `/public/images/og/hockey-pouches-og.png` with final OG image
  - [ ] Update `/public/images/og/hockey-logo.png` with final logo
  - [ ] Replace `/public/favicon.ico` with branded favicon
- [ ] Ensure all product images are optimized for web
- [ ] Verify all content is finalized (product descriptions, etc.)
- [ ] Set up Google verification code in environment variables

### 4. Payment Processing

- [ ] Configure production payment gateway credentials
- [ ] Test complete payment flow end-to-end
- [ ] Set up webhook handling for payment events
- [ ] Configure email notifications for successful/failed payments

### 5. Performance & Monitoring

- [x] Fix linter errors including apple-touch-icon placement
- [ ] Implement proper caching strategies
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics tracking
- [ ] Set up uptime monitoring
- [ ] Implement performance monitoring

### 6. Environment Variables

Ensure all environment variables are configured in Vercel:

```bash
# Base URL
NEXT_PUBLIC_BASE_URL=https://nicotinetins.com

# Database
POSTGRES_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=your_google_verification_code

# Additional environment variables as in .env.example
```

### 7. Final Testing

- [ ] Test all user flows (registration, login, checkout, etc.)
- [ ] Verify mobile responsiveness
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify all emails are sending correctly
- [ ] Test all payment methods

### 8. Launch Steps

1. Run final build: `npm run build`
2. Deploy to production: `vercel --prod`
3. Verify DNS settings
4. Submit sitemap to search engines
5. Monitor initial traffic and performance

## Next Steps

1. **Complete Frontend Pages**: Implement remaining frontend pages and components
2. **Implement Remaining API Routes**: Complete any remaining API routes
3. **Add Testing**: Implement unit and integration tests
4. **Optimize Performance**: Improve loading times and performance
5. **Enhance Security**: Add rate limiting and additional security measures
6. **Documentation**: Complete API documentation and user guides
