# Hockey Puxx - E-commerce & MLM Platform

A Next.js e-commerce website for Hockey Puxx nicotine pouches, targeting the Canadian market. This platform includes standard e-commerce functionality along with a multi-level marketing (MLM) system for referrals and distributors, plus comprehensive admin management tools.

Built with Next.js 15 and Tailwind CSS v4.

## Core Features

*   **E-commerce:** Product browsing, cart, checkout (Credit Card, E-Transfer, potential BTC).
*   **MLM System:**
    *   **Retail Customer/Referrers:** Can buy products and earn 5% commission via referral code/link.
    *   **Distributors:** Regional inventory management (Vancouver, Calgary, Edmonton, Toronto) and order fulfillment.
    *   **Wholesale Buyers:** Bulk purchasing with referral requirement.
*   **Admin Management:** Full oversight of users, products, inventory, orders (approval/assignment/verification), commissions, finances, and task management.

## Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Analytics**: Google Analytics (GA4), Microsoft Clarity, Vercel Analytics
*   **Form Handling**: React Hook Form (intended), HeroTofu (current for basic forms?)
*   **Potential Database**: MongoDB (planned/assumed, TBD)

## Project Status (October 2023)

*   **Phase 1: Scaffolding (Complete)**
    *   Basic Next.js site structure established.
    *   API Route placeholders (`/app/api/.../route.ts`) created for all major features (Auth, Users, Products, Inventory, Orders, Tasks, Commissions, Payments).
    *   Frontend Page placeholders (`/app/.../page.tsx`) created for Public, Retail Customer Dashboard, Distributor Dashboard, and Admin Dashboard views.
    *   Basic build errors resolved.
*   **Phase 2: Implementation (Starting)**
    *   Next steps involve implementing the logic within the placeholder files as detailed in the `// TODO:` comments.
    *   Requires database setup/connection, authentication logic, UI component building, etc.

## Project Structure (Expanded)

*   `/app`: Next.js App Router structure
    *   `/api`: Backend API routes (organized by feature/entity)
        *   `/auth`, `/users`, `/products`, `/orders`, `/tasks`, `/commissions`, `/payments`
        *   `/admin`: Admin-specific routes for users, products, inventory, orders, tasks, commissions.
        *   `/distributor`: Distributor-specific routes.
    *   `/components`: Reusable React components (UI, Layout)
        *   `/layout`: Main layout components (e.g., `NewLayout.tsx`)
        *   `/ui`: General UI elements.
    *   `/dashboard`: Retail Customer dashboard pages.
    *   `/distributor/dashboard`: Distributor dashboard pages.
    *   `/admin/dashboard`: Admin dashboard pages.
    *   `/data`: Static data (like initial `products.ts`).
    *   `/(public pages)`: Root pages like `page.tsx`, `products/page.tsx`, `about/page.tsx`, `faq/page.tsx`, `login/page.tsx`, `register/page.tsx`.
    *   `/_components`: Root-level client components (analytics, etc.).
*   `/public`: Static assets (images, favicon).
*   `/scripts`: Utility scripts.
*   `README.md`: This file.
*   `package.json`, `tsconfig.json`, `next.config.js`, etc.: Project configuration.

## Getting Started

### Prerequisites

*   Node.js 18.17.0 or later
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/jdevop33/hockey-pouches.git
    cd hockey-pouches
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory with necessary variables (see original list + any new ones for database, auth secrets, payment gateways etc. as they are added):
    ```dotenv
    NEXT_PUBLIC_BASE_URL=https://nicotinetins.com # Or your dev URL
    NEXT_PUBLIC_CONTACT_EMAIL=info@nicotinetins.com
    NEXT_PUBLIC_SITE_NAME="Hockey Puxx"
    NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PMM01WKF05
    # Add Database Connection Strings (e.g., MONGODB_URI)
    # Add Authentication Secrets (e.g., JWT_SECRET, NEXTAUTH_SECRET)
    # Add Payment Gateway Keys (e.g., STRIPE_SECRET_KEY)
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

1.  **Scaffolding (Done):** Create placeholder files for structure.
2.  **Implementation:**
    *   Pick a feature or section (e.g., User Auth API, Product API, Login Page UI).
    *   Implement the logic outlined in the `// TODO:` comments within the relevant files.
    *   Write database interaction code.
    *   Build required UI components.
    *   Test the implemented feature.
3.  **Commit & Push:** Commit changes frequently with clear messages.
    ```bash
    git add .
    git commit -m "feat: Implement user login API endpoint"
    npm run git:push 
    ```
4.  **Deploy (Optional but recommended):** Deploy to Vercel staging/preview environments often to catch build/runtime errors early.
    ```bash
    npm run deploy
    ```

## Available Scripts

*   `npm run dev` - Start development server
*   `npm run build` - Build for production
*   `npm run build:no-lint` - Build without linting
*   `npm run start` - Start production server
*   `npm run lint` - Run ESLint
*   `npm run format` - Format code with Prettier
*   `npm run format:check` - Check formatting
*   `npm run typecheck` - Run TypeScript type checking (`npx tsc --noEmit`)
*   `npm run deploy` - Deploy to Vercel
*   `npm run git:push` - Push to GitHub

## Deployment

Deployed on Vercel. Production: [https://nicotinetins.com](https://nicotinetins.com) (or final URL).

## Key Next Steps (Implementation Phase)

1.  **Database Setup:** Choose and configure the database (e.g., MongoDB Atlas). Add connection logic.
2.  **Authentication:** Implement API logic (`/api/auth/...`) and frontend UI (`/login`, `/register`) for user registration, login, session/token management, and role-based access control.
3.  **Core E-commerce Flow:** Implement Product API, Cart functionality, Order Creation API, basic Order display.
4.  **MLM Logic:** Implement referral code tracking, commission calculation rules (Referral, Fulfillment), commission display.
5.  **Admin Functionality:** Implement API endpoints and corresponding frontend pages for managing users, products, inventory, orders (approval, assignment, etc.), tasks, and commissions (including payouts).
6.  **Distributor Flow:** Implement order fulfillment API endpoint and Distributor Dashboard UI.
7.  **Payment Integration:** Integrate with chosen payment gateways (Stripe, PayPal, Manual methods like E-Transfer/BTC confirmation workflow).

