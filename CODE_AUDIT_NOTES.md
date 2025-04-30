# Codebase Audit Notes

This file contains notes and potential improvements identified during the codebase audit conducted on [Date].

## Configuration Files (`package.json`, `next.config.mjs`, `tsconfig.json`)

### `package.json`

1.  **Dependency Updates:** Several dependencies could be updated to their latest stable versions for potential bug fixes, performance improvements, and new features.
    *   `@neondatabase/serverless`: `^1.0.0` -> Suggest `^1.1.3` (Neon latest as of July 2024).
    *   `@stripe/stripe-js`: `^7.2.0` -> Suggest `^7.5.0` (Stripe.js latest as of July 2024).
    *   `lucide-react`: `^0.503.0` -> Suggest `^0.437.0` (Lucide latest as of July 2024).
    *   `stripe`: `^18.0.0` -> Suggest `^18.3.0` (Stripe Node latest as of July 2024).
    *   `tailwindcss`: `3.3.5` -> Suggest `^3.4.10` (Tailwind latest v3 as of July 2024). *Note: `@tailwindcss/postcss` is at `^4.1.4`. Verify if Tailwind v4 setup is intended or if this is a mismatch.*
    *   *(Dev)* `typescript`: `^5.0.0` -> Suggest `^5.6.2` (TypeScript latest as of July 2024).
2.  **Deprecated `next-fonts`:** The `next-fonts` package (`^1.5.1`) is deprecated. Its functionality is built into Next.js (since v11). Suggest removing this dependency and configuring fonts directly in CSS or using `next/font`. (Next.js 11+).
3.  **Beta `next-themes`:** Using `next-themes@1.0.0-beta.0`. This is likely for React 19 support. Monitor for stable releases and update when available.
4.  **Drizzle Versioning:** `drizzle-orm` (`0.43.1`) and `drizzle-kit` (`0.31.0`) versions seem unusual compared to the main Drizzle releases (`0.3x`). Verify if these specific versions are required for the Neon driver or if they can be aligned with standard Drizzle versions (e.g., `drizzle-orm@0.33.0`, `drizzle-kit@0.23.0`).
5.  **Build Script Linting:** The `build` script (`next build --no-lint`) disables ESLint checks. **High Priority:** Suggest removing `--no-lint` and addressing all lint errors to ensure code quality and prevent potential issues. The separate `build:no-lint` script seems redundant if the primary build ignores linting. (ESLint Best Practice).
6.  **Script Runner:** Scripts using `node --loader ts-node/esm` are functional. Consider evaluating `tsx` as an alternative runner for potentially improved performance or simpler configuration. (Node.js ecosystem).

### `next.config.mjs`

1.  **Build Error Ignoring:**
    *   `eslint: { ignoreDuringBuilds: true }`: **High Priority:** Suggest setting to `false` (or removing the block) and fixing lint errors. Clean builds are crucial. (Next.js Best Practice).
    *   `typescript: { ignoreBuildErrors: true }`: **High Priority:** Suggest setting to `false` (or removing the block) and fixing TypeScript errors. Type errors often indicate real bugs. (TypeScript/Next.js Best Practice).
2.  **SVG Security (`dangerouslyAllowSVG: true`):** While enabled, ensure all SVGs used are either from trusted sources or properly sanitized to prevent potential XSS vulnerabilities if they contain embedded scripts. (Web Security Best Practice).
3.  **Webpack `resolve.extensionAlias`:** The custom webpack configuration for resolving `.ts`/`.tsx` might be outdated or unnecessary with current Next.js (v15) and TypeScript (v5.x) versions. Suggest testing removal of this custom webpack config block to see if resolution still works correctly. (Next.js/Webpack).

### `tsconfig.json`

1.  **Enable Stricter Checks:**
    *   `noUnusedLocals: false` -> Suggest changing to `true` and removing unused variables. (TypeScript Best Practice).
    *   `noUnusedParameters: false` -> Suggest changing to `true` and removing unused function parameters (or prefixing with `_` if intentionally unused but required by an interface/type). (TypeScript Best Practice).
2.  **Module Resolution:** `moduleResolution: "node"` -> Consider changing to `"bundler"` which might be a more accurate setting for modern bundler-based projects (like Next.js) and aligns better with current TypeScript recommendations (Requires TS 5.0+, which is met).

## App Structure & Core Logic (`app/layout`, `app/providers`, `app/middleware`, `app/lib`)

### Layout & Providers (`app/layout.tsx`, `app/providers/Providers.tsx`)

1.  **Root Layout:** Uses `next/font/google` for Inter font. Includes preconnect links for Google Fonts, GA, GTM, and Clarity. Sets basic metadata and viewport.
2.  **Providers (`app/providers/Providers.tsx`):**
    *   Wraps children with `StoreProvider` (Zustand hydration helper), `ThemeProviderClient`, `AuthProvider`, `ToastProvider`, `CsrfProvider`, `CartProvider`.
    *   Uses `useState/useEffect` with `mounted` flag to delay rendering of providers until client-side hydration, preventing mismatches. Good practice.
    *   Dynamically imports `ClientAnalytics` with `ssr: false`.
3.  **CSS Loading:** `globals.css` is imported in `layout.tsx`. `index.css` exists but doesn't seem to be imported in the layout - investigate if it's used elsewhere or redundant.
4.  **Hardcoded `<html lang="en" className="dark">`:** Theme is hardcoded to dark in the root layout. Consider if this should be dynamic based on `ThemeProviderClient`'s state.
5.  **`suppressHydrationWarning`:** Used on `<html>` and `<body>`. While sometimes necessary, investigate the root causes of hydration warnings if possible.

### Global Styles (`app/globals.css`, `app/index.css`)

1.  **Structure:** `globals.css` uses Tailwind `@layer` directives (base, components, utilities). Defines CSS variables for colors (`--primary-gold`, `--dark-bg`, etc.). Includes custom components (`.luxury-container`, `.btn-gold-contrast`), base styles (headings, links), utility overrides (borders, text), animations, and accessibility modes (`high-contrast`, `reduced-motion`, `dyslexic-font`).
2.  **Potential Overlap:** `index.css` also defines base styles (fonts, body, headings, code blocks, scrollbar). There might be overlap or conflict with `globals.css`. Consolidate global styles into one primary file (`globals.css`) or ensure clear separation of concerns. (CSS Maintainability).
3.  **Accessibility Classes:** `.high-contrast`, `.reduced-motion`, `.dyslexic-font` modify styles using `!important`. While necessary for overrides, use sparingly. Ensure the mechanism for applying these classes (likely via state/context) is robust. (CSS/Accessibility Best Practice).
4.  **Hardcoded Colors:** Some component styles (e.g., `.btn-gold-contrast`, inputs) use hardcoded hex/rgb values (#1e293b) instead of Tailwind color names or CSS variables. Prefer theme-based values for consistency. (Tailwind Best Practice).

### Middleware (`app/middleware.ts`)

1.  **Rate Limiting:** Implements rate limiting using an **in-memory `Map`**. **Critical:** This is unsuitable for production/serverless environments where instances are ephemeral. Replace with a persistent store like Redis (e.g., Upstash) or Vercel KV. (Scalability/Reliability).
    *   Uses IP address and path for rate limit key. Considers `req.ip` (Vercel) and `x-forwarded-for`.
    *   Includes configurations for different limits (global, auth, API).
    *   Sets standard rate limit headers (`X-RateLimit-*`, `Retry-After`).
2.  **CSRF Protection:** Includes CSRF protection logic using `csrf-server.ts`. Checks for cookie (`csrf_token`) and header (`X-CSRF-Token`) on non-GET/HEAD/OPTIONS requests for applicable routes. Logs failures.
3.  **Scope:** Currently configured via `config.matcher` to run only on `/api/:path*`. Evaluate if other routes require middleware checks (e.g., page-level auth).
4.  **Logging:** Uses `logger.warn` for rate limit and CSRF failures.

### Libraries & Services (`app/lib`)

1.  **Database (`db.ts`):** Uses `drizzle-orm/neon-http` with `@neondatabase/serverless`. Implements connection caching (`cachedDb`, `cachedNeonSql`) suitable for serverless. Includes environment variable check (`POSTGRES_URL`) and a health check function (`isDatabaseHealthy`). Good setup.
2.  **Authentication (`auth.ts`):** Implements JWT (access + refresh) logic using `jsonwebtoken`. Includes verification helpers (`verifyAuth`, `verifyAdmin`, `verifyDistributor`, `verifyResourceAccess`). Checks against a token blacklist (`isTokenBlacklisted`). Needs `JWT_SECRET` env var. Seems solid, relies on `blacklist.ts`.
3.  **Logging (`logger.ts`):** Provides structured logging (`debug`, `info`, `warn`, `error`) with context. Includes request/response logging helpers (`logRequest`, `logResponse`, `withLogging`). Stores logs in memory for dev. **Suggestion:** Integrate with a production logging service (e.g., Vercel Logs, BetterStack, Sentry) for production builds. (Observability).
4.  **Schemas (`schema/`):** Centralized schema definitions using Drizzle. Exported via `schema/index.ts`. Good organization.
5.  **Services (`services/`):** Contains service classes (e.g., `UserService`, `ProductService`). **CRITICAL:** `UserService` methods (`getUserById`, `createUser`, `authenticate`, etc.) are largely **unimplemented stubs** that log warnings and/or throw errors. This indicates core user functionality is likely missing or incomplete. **Highest Priority:** Implement these service methods based on application requirements. (Functionality).
6.  **Token Blacklist (`blacklist.ts`):** Handles blacklisting JWTs (likely for logout). Needs review to understand storage mechanism (in-memory? DB?). (Security).
7.  **Rate Limiting (`rateLimit.ts`):** Defines rate limit configurations (limits, windows) used by the middleware.
8.  **CSRF (`csrf-client.ts`, `csrf-server.ts`):** Contains logic for generating and validating CSRF tokens on the client and server.

## API Routes (`app/api`)

### Authentication (`api/auth/*`)

1.  **Login (`/login`):**
    *   Uses `userService.authenticate`.
    *   Validates input with `zod` (`loginSchema`).
    *   Wrapped with `withRateLimit` and `withCsrfProtection`.
    *   Generates and returns both access and refresh tokens.
    *   Handles `userService` configuration errors and JSON parsing errors gracefully.
    *   **Dependency:** Relies heavily on the **unimplemented** `userService.authenticate`.
2.  **Register (`/register`):**
    *   Uses `userService.createUser`.
    *   Validates input with `zod` (`registerSchema`).
    *   Wrapped with `withRateLimit` and `withCsrfProtection`.
    *   Handles specific role (`Distributor`) requiring approval (logs info, mentions TODO for notification/task).
    *   Mentions TODO for referral code handling and triggering commission.
    *   Returns 201 on success.
    *   Handles potential `Email already in use` error (409).
    *   **Dependency:** Relies heavily on the **unimplemented** `userService.createUser`.

### Products (`api/products/*`)

1.  **Product Detail (`/[productId]` - GET):**
    *   Parses and validates `productId` from URL parameters.
    *   Uses `unstable_cache` from `next/cache` to cache DB results (`getProductFromDb`) for 1 hour with tags (`product:[id]`). Good for performance.
    *   `getProductFromDb` function queries the DB using Drizzle (`db.query.products.findFirst`) for an active product.
    *   Handles `product not found` (404) and database errors (500) gracefully.
    *   Returns the product object as JSON.

### Users (`api/users/*`)

1.  **Current User (`/me` - GET):**
    *   Uses `verifyAuth` to authenticate the request via JWT.
    *   Calls `userService.getUserById` to fetch the user's profile.
    *   Handles cases where the profile isn't found despite a valid token (404/500).
    *   Returns the user profile (service should exclude sensitive fields).
    *   **Dependency:** Relies on **unimplemented** `userService.getUserById`.
2.  **Current User (`/me` - PATCH):**
    *   Uses `verifyAuth`.
    *   Validates the request body using a strict `zod` schema (`updateProfileSchema`) to allow only specific fields (e.g., `name`). Good practice to prevent mass assignment.
    *   Checks if any update data was actually provided.
    *   Calls `userService.updateUser` with the validated data.
    *   Returns the updated user profile.
    *   **Dependency:** Relies on **unimplemented** `userService.updateUser`.

## Frontend & UI Components (`app/page.tsx`, `app/components`, `app/store`, `app/context`)

### Pages (`app/page.tsx`, `app/products/page.tsx`, `app/cart/page.tsx`)

1.  **Homepage (`app/page.tsx`):**
    *   Client component (`'use client'`).
    *   Uses `Layout` component.
    *   Hardcodes `featuredProducts` and `testimonials` data directly in the component. **Suggestion:** Fetch dynamic product/testimonial data from an API endpoint. (Maintainability/Scalability).
    *   Uses `next/image` with priority and sizes attributes for hero image. Good practice.
    *   Uses `lucide-react` icons.
    *   Includes multiple sections (Hero, Featured Products, Quality, Testimonials, CTA).
    *   Uses `ProductImage` component for product cards.
    *   Links to `/products` and `/about`. Includes hardcoded discount code (`PREMIUM15`) in CTA.
2.  **Products Page (`app/products/page.tsx`, `app/products/ProductsContent.tsx`):
    *   `page.tsx` is a Server Component wrapper around `ProductsContent.tsx` (Client Component).
    *   `ProductsContent` fetches products from `/api/products` using `useEffect` and `useState`.
    *   Handles loading and error states.
    *   Includes client-side pagination logic (`currentPage`, `totalPages`, `handlePageChange`).
    *   Uses `useCart` context for `addToCart` functionality.
    *   Includes fallback for missing product images and handles image load errors.
    *   Parses product price from string to float if necessary.
3.  **Cart Page (`app/cart/page.tsx`):
    *   Client component (`'use client'`).
    *   Uses `Layout` component.
    *   Uses `useCart` context extensively (`items`, `itemCount`, `subtotal`, `updateQuantity`, `removeFromCart`, `clearCart`).
    *   Includes `useState/useEffect` for `isMounted` to prevent hydration issues before accessing cart context.
    *   Displays items, allows quantity changes, shows subtotal.
    *   Provides buttons for checkout (`router.push('/checkout')`), clearing cart, and continuing shopping.
    *   Includes an empty cart state.

### UI Components (`app/components/ui`, `app/components/layout`)

1.  **Navbar (`layout/Navbar.tsx`):
    *   Client component (`'use client'`).
    *   Uses `useState/useEffect` for `isMounted` check and renders a `StaticNavbar` during SSR/hydration. Good pattern.
    *   Uses `useState/useEffect` to track scroll position (`scrolled`) and apply background/shadow changes.
    *   Dynamically generates nav items based on user auth state and role using `useAuth` context.
    *   Handles mobile menu state (`mobileMenuOpen`).
    *   Uses `lucide-react` for icons.
    *   Includes cart icon with item count from `useCart` context.
    *   Provides account/login/logout functionality.
2.  **Button (`ui/Button.tsx`, `ui/NewButton.tsx`):
    *   **Redundancy:** There are two button components: `Button.tsx` and `NewButton.tsx`. They seem to serve similar purposes but have different variant names and styling approaches.
        *   `Button.tsx` uses `class-variance-authority` (CVA) for variants (default, primary, destructive, outline, secondary, ghost, link, gold) and sizes. Includes `isLoading` state with `LoadingSpinner`.
        *   `NewButton.tsx` uses a simpler object mapping for variants (primary, secondary, outline, ghost) and sizes. Defines base classes separately.
    *   **High Priority:** Consolidate into a single, well-defined Button component. Choose one approach (likely CVA as it's more robust and used in `Button.tsx`) and migrate all usages. This improves consistency and maintainability. (Code Quality/Consistency).
    *   The `Button.tsx` component seems more feature-complete (e.g., `isLoading` state) and aligned with common UI library patterns (like shadcn/ui, which this resembles). Suggest standardizing on `Button.tsx` and removing/refactoring `NewButton.tsx`.

### State Management & Context (`app/store`, `app/context`)

1.  **Zustand Setup (`StoreProvider`, `initializeStore`, slices):
    *   Uses Zustand for global state (`auth`, `cart`, `products`, `ui`).
    *   `initializeStore` likely handles persistence (e.g., to `localStorage`) and hydration.
    *   `StoreProvider` waits for all stores to hydrate before rendering children.
    *   Slices define state structure and actions (`authStore`, `cartStore`, `productStore`, `uiStore`).
2.  **Auth State Redundancy (`authStore.ts` vs `AuthContext.tsx`):
    *   **Critical:** Both `useAuthStore` (Zustand) and `AuthContext` manage authentication state (user, token, isAuthenticated) and persist to `localStorage` independently.
    *   This duplication is problematic and can lead to synchronization issues.
    *   **Recommendation:** Choose one source of truth. Refactor `AuthContext` to consume the `useAuthStore` or use the store hook directly, removing the redundant state management and `localStorage` handling from the context.
3.  **Cart State Redundancy (`cartStore.ts` vs `CartContext.tsx`):
    *   **Critical:** Similar to auth, both `useCartStore` (Zustand) and `CartContext` (using `useReducer`) manage cart state (items, totals) and persist to `localStorage`.
    *   This also leads to duplication and potential inconsistencies.
    *   **Recommendation:** Consolidate cart logic into `useCartStore`. Refactor `CartContext` to consume the store or use the store hook directly.
4.  **Product State (`productStore.ts`):
    *   Manages product list, selection, and filters.
    *   **TODO:** Uses manually defined interfaces (`Product`, `ProductVariant`) instead of schema-derived types. Needs update for type safety.
    *   **TODO:** Filtering logic (`getFilteredProducts`) is incomplete (missing flavor, strength, sorting).
5.  **UI State (`uiStore.ts`):
    *   Manages toasts, modals, sidebar/cart visibility.
    *   Uses simple random IDs for toasts/modals.

## Dashboards (`app/admin/dashboard`, `app/dashboard`)

1.  **Admin Dashboard:** Contains numerous sub-sections for managing core resources (products, users, orders, inventory, commissions, discounts, etc.). Structure suggests standard CRUD interfaces.
2.  **User Dashboard:** Simpler structure focusing on user-specific data (orders, profile, referrals).

## Database Migrations (`db/migrations`)

1.  **Inconsistency:** Mix of manually named SQL files and Drizzle Kit generated files (`drizzle/`).
2.  **Duplication:** Presence of `_no_comments` variants of several SQL files is problematic.
3.  **Recommendation:** Standardize on Drizzle Kit for migration generation and management. Clean up manual files and duplicates, ensuring the Drizzle journal (`meta/_journal.json`) is the source of truth for applied migrations.

## Custom Scripts (`scripts/`)

1.  **Variety:** Contains scripts for building, deployment, git actions, asset generation (OG images), migrations, and basic testing.
2.  **Redundancy:** `build-no-lint.js` likely duplicates functionality in `package.json` build script.
3.  **Testing:** Basic test scripts (`test-*.js`, `test-*.ts`). **Suggestion:** Implement a proper testing framework (e.g., Vitest, Jest) for better structure, assertions, and coverage.
4.  **Oddity:** Presence of `scripts/package.json` is unusual and needs investigation.

---
