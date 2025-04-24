// app/lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

// Admin roles
const ADMIN_ROLES = ['Admin'];
const DISTRIBUTOR_ROLES = ['Distributor'];

/**
 * Verify JWT token from request headers
 * @param request NextRequest object
 * @returns AuthResult with authentication status and user info
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return { 
      isAuthenticated: false, 
      message: 'Authentication token is missing' 
    };
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return {
      isAuthenticated: true,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.warn('Token verification failed:', error);
    return { 
      isAuthenticated: false, 
      message: 'Invalid or expired token' 
    };
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
      email: authResult.email
    };
  }

  return {
    ...authResult,
    message: 'Admin authentication successful'
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
      email: authResult.email
    };
  }

  return {
    ...authResult,
    message: 'Distributor authentication successful'
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
      message: 'Admin has access to this resource'
    };
  }

  // Check if the authenticated user is the owner of the resource
  if (authResult.userId !== resourceUserId) {
    return {
      isAuthenticated: true,
      userId: authResult.userId,
      role: authResult.role,
      message: 'User does not have access to this resource',
      email: authResult.email
    };
  }

  return {
    ...authResult,
    message: 'User has access to this resource'
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
