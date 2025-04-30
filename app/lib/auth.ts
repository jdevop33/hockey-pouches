// app/lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './blacklist';
import { logger } from './logger';

// Define JWT payload structure
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Auth result interface
export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
  email?: string;
  message?: string;
}

// Define refresh token payload
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

// Admin roles
const ADMIN_ROLES = ['Admin'];
const DISTRIBUTOR_ROLES = ['Distributor'];

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Verify JWT token from Authorization header
 * @param request NextRequest object
 * @returns AuthResult with authentication status and user info
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  // If no token, authentication fails
  if (!token) {
    return {
      isAuthenticated: false,
      message: 'Authentication token is missing',
    };
  }

  // Check if token is blacklisted
  if (await isTokenBlacklisted(token)) {
    logger.warn('Blacklisted token used for authentication');
    return {
      isAuthenticated: false,
      message: 'Token has been revoked',
    };
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Create a response with the decoded user info
    const authResult: AuthResult = {
      isAuthenticated: true,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };

    return authResult;
  } catch (error) {
    console.warn('Token verification failed:', error);
    return {
      isAuthenticated: false,
      message: 'Invalid or expired token',
    };
  }
}

/**
 * Generate a new access token
 * @param payload JWT payload
 * @returns Access token
 */
export function generateAccessToken(payload: JwtPayload): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a new refresh token
 * @param userId User ID
 * @param tokenVersion Token version (incremented on logout)
 * @returns Refresh token
 */
export function generateRefreshToken(userId: string, tokenVersion: number = 0): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  const payload: RefreshTokenPayload = { userId, tokenVersion };
  return jwt.sign(payload, jwtSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken Refresh token
 * @param userData User data to include in new access token
 * @returns New access token or null if refresh token is invalid
 */
export async function refreshToken(
  refreshToken: string,
  userData: Omit<JwtPayload, 'userId'>
): Promise<string | null> {
  // Check if refresh token is blacklisted
  if (await isTokenBlacklisted(refreshToken)) {
    logger.warn('Blacklisted refresh token used');
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, jwtSecret) as RefreshTokenPayload;

    // Create a new access token
    const payload: JwtPayload = {
      userId: decoded.userId,
      email: userData.email,
      role: userData.role,
    };

    return generateAccessToken(payload);
  } catch (error) {
    console.warn('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Verify if the user is an admin
 * @param request NextRequest object
 * @returns AuthResult with admin status
 */
export async function verifyAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request);

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  if (!authResult.role || !ADMIN_ROLES.includes(authResult.role)) {
    return {
      isAuthenticated: true,
      userId: authResult.userId,
      role: authResult.role,
      message: 'User is not authorized for admin access',
      email: authResult.email,
    };
  }

  return {
    ...authResult,
    message: 'Admin authentication successful',
  };
}

/**
 * Verify if the user is a distributor
 * @param request NextRequest object
 * @returns AuthResult with distributor status
 */
export async function verifyDistributor(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request);

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  if (!authResult.role || !DISTRIBUTOR_ROLES.includes(authResult.role)) {
    return {
      isAuthenticated: true,
      userId: authResult.userId,
      role: authResult.role,
      message: 'User is not authorized for distributor access',
      email: authResult.email,
    };
  }

  return {
    ...authResult,
    message: 'Distributor authentication successful',
  };
}

/**
 * Verify if the user has access to a specific resource
 * @param request NextRequest object
 * @param resourceUserId ID of the user who owns the resource
 * @returns AuthResult with resource access status
 */
export async function verifyResourceAccess(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthResult> {
  const authResult = await verifyAuth(request);

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  // Admins have access to all resources
  if (authResult.role && ADMIN_ROLES.includes(authResult.role)) {
    return {
      ...authResult,
      message: 'Admin has access to this resource',
    };
  }

  // Check if the authenticated user is the owner of the resource
  if (authResult.userId !== resourceUserId) {
    return {
      isAuthenticated: true,
      userId: authResult.userId,
      role: authResult.role,
      message: 'User does not have access to this resource',
      email: authResult.email,
    };
  }

  return {
    ...authResult,
    message: 'User has access to this resource',
  };
}

/**
 * Helper function to create an unauthorized response
 * @param message Error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ message }, { status: 401 });
}

/**
 * Helper function to create a forbidden response
 * @param message Error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ message }, { status: 403 });
}

/**
 * Verify JWT token directly
 * @param token JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  // Check if token is blacklisted
  if (await isTokenBlacklisted(token)) {
    logger.warn('Blacklisted token used for verification');
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    console.warn('Token verification failed:', error);
    return null;
  }
}
