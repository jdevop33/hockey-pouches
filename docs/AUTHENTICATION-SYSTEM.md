# Authentication System Documentation

## Overview

The Hockey Pouches authentication system uses JWT (JSON Web Tokens) for secure API access with token refresh and blacklisting capabilities. This document outlines the authentication flow, key components, and usage guidelines.

## Key Features

- **JWT-based Authentication**: Secure token-based authentication
- **Token Refresh**: Automatic token refresh to maintain sessions
- **Token Blacklisting**: Invalidation of tokens on logout
- **Role-based Access Control**: Admin, Distributor, and Customer roles
- **API Protection**: Middleware for securing API routes

## Authentication Flow

1. **Login**: User authenticates with credentials and receives:

   - Access Token (1 hour validity)
   - Refresh Token (7 days validity)

2. **API Requests**: Client includes access token in `Authorization` header

3. **Token Refresh**: When the access token is about to expire, the client:

   - Makes a refresh request using the refresh token
   - Receives a new access token
   - Updates the token in storage

4. **Logout**: On logout:
   - Client removes tokens from local storage
   - Server adds tokens to blacklist

## Core Components

### Server-Side

- **`app/lib/auth.ts`**: Main authentication utilities

  - `verifyAuth`: Verifies access tokens
  - `verifyAdmin`: Checks for admin access
  - `verifyDistributor`: Checks for distributor access
  - `generateAccessToken`: Creates new access tokens
  - `generateRefreshToken`: Creates new refresh tokens
  - `refreshToken`: Refreshes expired tokens

- **`app/lib/blacklist.ts`**: Token invalidation system

  - `blacklistToken`: Adds tokens to the blacklist
  - `isTokenBlacklisted`: Checks if a token is revoked

- **Authentication Routes**:
  - `app/api/auth/login`: Issues tokens on successful login
  - `app/api/auth/register`: Creates new user accounts
  - `app/api/auth/refresh`: Refreshes expired access tokens
  - `app/api/auth/logout`: Blacklists tokens

### Client-Side

- **`app/store/slices/authStore.ts`**: Auth state management

  - Stores user information and tokens
  - Handles login, logout, and token refresh

- **`app/components/AuthTokenRefresher.tsx`**: Automatic token refresh

  - Monitors token expiry
  - Initiates refresh before expiration

- **`app/lib/utils/fetcher.ts`**: Auth-aware API utilities
  - `fetchWithAuth`: Makes authenticated requests
  - Handles 401 responses with automatic token refresh

## Making Authenticated Requests

Use the `fetchWithAuth` utility for all authenticated API requests:

```javascript
import { fetchWithAuth, fetchJsonWithAuth } from '@/lib/utils/fetcher';

// Simple GET request
const response = await fetchWithAuth('/api/users/me');

// GET request with JSON response
const userData = await fetchJsonWithAuth('/api/users/me');

// POST request with body
const result = await fetchJsonWithAuth('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ productId: '123', quantity: 2 }),
});
```

## Securing Routes

### API Routes

Use the authentication middleware in API routes:

```javascript
// app/api/orders/route.ts
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (!authResult.isAuthenticated) {
    return unauthorizedResponse();
  }

  // Proceed with authenticated request...
}
```

### Admin Routes

Use the admin verification middleware:

```javascript
// app/api/admin/users/route.ts
import { verifyAdmin, forbiddenResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
    return forbiddenResponse('Admin access required');
  }

  // Proceed with admin request...
}
```

## Production Considerations

For production deployment, consider the following enhancements:

1. **Redis Integration**: Replace in-memory blacklist with Redis for scalability
2. **HTTPS Only**: Ensure all token transmission happens over HTTPS
3. **Secure JWT Secret**: Use a strong, environment-specific JWT secret
4. **Token Fingerprinting**: Add device fingerprinting to tokens for enhanced security
5. **Audit Logging**: Log all authentication events for security monitoring
