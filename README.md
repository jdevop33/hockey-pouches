# Hockey Puxx - E-commerce & MLM Platform

A Next.js e-commerce website for Hockey Puxx nicotine pouches, targeting the Canadian market. This platform includes standard e-commerce functionality along with a multi-level marketing (MLM) system for referrals and distributors, plus comprehensive admin management tools.

Built with Next.js (`14.2.28`) and Tailwind CSS v4.

## Core Features

*   **E-commerce:** Product browsing, cart, checkout (Credit Card, E-Transfer, potential BTC).
*   **MLM System:**
    *   **Retail Customer/Referrers:** Can buy products and earn 5% commission via referral code/link.
    *   **Distributors:** Regional inventory management (Vancouver, Calgary, Edmonton, Toronto) and order fulfillment.
    *   **Wholesale Buyers:** Bulk purchasing with referral requirement.
*   **Admin Management:** Full oversight of users, products, inventory, orders (approval/assignment/verification), commissions, finances, and task management.

## Tech Stack

*   **Framework**: Next.js `14.2.28` (App Router)
*   **Styling**: Tailwind CSS v4
*   **Language**: TypeScript `~5.0.0`
*   **Database**: Neon (PostgreSQL) via `@neondatabase/serverless`
*   **Auth**: `bcrypt` for hashing, `jsonwebtoken` for tokens
*   **Analytics**: Google Analytics (GA4), Microsoft Clarity, Vercel Analytics

## Project Status (Apr 22, 2025)

*   **Phase 1: Scaffolding (Complete)**
    *   Full project structure (API routes, Frontend pages) created based on scope.
    *   Neon DB connection utility (`/app/lib/db.ts`) established.
    *   `users` table created in Neon DB.
    *   Basic Register/Login API implemented (with DB checks, hashing).
    *   Basic Auth Context (`/app/context/AuthContext.tsx`) implemented using localStorage.
    *   Layout updated for basic Login/Logout display.
    *   Vercel build is stable.
*   **Phase 2: Implementation (In Progress)**
    *   Currently focused on solidifying the Authentication flow.
    *   Next steps involve implementing the logic within the placeholder files as detailed in the `// TODO:` comments.

## Project Structure (Expanded)

*   `/app`: Next.js App Router structure
    *   `/api`: Backend API routes (Auth, Users, Products, Orders, etc. + Admin/Distributor)
    *   `/components`: Reusable React components (Layout, UI, Cart)
    *   `/context`: React Context providers (AuthContext, CartContext)
    *   `/lib`: Utility functions (e.g., `db.ts`)
    *   `/dashboard`: Retail Customer dashboard pages.
    *   `/distributor/dashboard`: Distributor dashboard pages.
    *   `/admin/dashboard`: Admin dashboard pages.
    *   `/data`: Static data (initial `products.ts`).
    *   `/(public pages)`: Root pages (`page.tsx`, `products/page.tsx`, etc.)
    *   `/_components`: Root-level client components (analytics, etc.).
*   `/public`: Static assets.
*   `/scripts`: Utility scripts.
*   `.github/workflows`: Contains `neon_workflow.yml` for automatic preview DB branches (if added).
*   Config files: `README.md`, `package.json`, `tsconfig.json`, `next.config.js`, `.env.local`

## Getting Started

### Prerequisites

*   Node.js `~18.17.0` or later
*   npm or yarn
*   Access to the Neon project & Vercel project.

### Installation

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  **Environment Variables:** Create `.env.local` file (copy from `.env.example` if available or use structure below) and populate with actual values from Vercel / Neon / Service accounts. **Ensure Vercel project environment variables are also set.**
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
4.  Start the development server: `npm run dev`
5.  Open [http://localhost:3000](http://localhost:3000).

## Development Workflow

1.  **Scaffolding (Done):** Basic structure is complete.
2.  **Implementation:**
    *   Focus on implementing features based on `// TODO:` comments.
    *   Start with core auth (`/api/users/me`, securing pages).
    *   Move to core e-commerce (Products, Cart, Orders).
    *   Implement MLM features (Referrals, Commissions).
    *   Build out Admin/Distributor dashboards.
3.  **Testing:** Add tests as features are developed.
4.  **Commit & Push:** Use conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
5.  **Deploy:** Use `npm run deploy` or Vercel dashboard. Automatic preview branches should be active via GitHub Actions.

## Available Scripts

*   `npm run dev`
*   `npm run build`
*   `npm run start`
*   `npm run lint`
*   `npm run typecheck`
*   `npm run deploy`
*   `npm run git:push`

## Deployment

Deployed on Vercel. Automatic preview branches created via GitHub Actions workflow (`.github/workflows/neon_workflow.yml`).

## Key Next Steps (Implementation Phase)

1.  **Implement `/api/users/me` Endpoint:** Verify JWT, fetch user data.
2.  **Secure Frontend Pages:** Implement auth checks and redirects in dashboard pages.
3.  **Secure API Routes:** Add JWT verification middleware or checks to protected API routes.
4.  **Refine Auth Flow:** Implement logout API call, consider token refresh strategy, improve redirects.
5.  **Implement Product Features:** API CRUD, Frontend display.
6.  **(Continue implementing other features based on priority)**

