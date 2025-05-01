// app/api/auth/register/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { userService, type CreateUserParams } from '@/lib/services/user-service'; // Use refactored service
import * as schema from '@/lib/schema'; // Use central schema index
import { withRateLimit, rateLimits } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/csrf-server';
import { z } from 'zod';

// Zod schema for registration validation
const registerSchema = z.object({
    name: z.string().min(1, "Full name is required").trim(),
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(schema.userRoleEnum.enumValues).default('Customer'),
    referralCode: z.string().trim().optional().nullable(),
});

const APPROVAL_REQUIRED_ROLES: (typeof schema.userRoleEnum.enumValues[number])[] = ['Distributor'];

export const POST = withRateLimit(
    withCsrfProtection(async (request: NextRequest) => {
        try {
            const body = await request.json();
            const validationResult = registerSchema.safeParse(body);
            if (!validationResult.success) {
                logger.warn('Registration validation failed', { errors: validationResult.error.flatten().fieldErrors });
                return NextResponse.json({ message: 'Invalid registration data.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
            }
            const { name, email, password, role, referralCode } = validationResult.data;
            const lowerCaseEmail = email.toLowerCase();
            logger.info('Registration attempt', { email: lowerCaseEmail, role });

            const createParams: CreateUserParams = {
                name, email: lowerCaseEmail, password, role,
                // TODO: Pass referralCode to UserService
            };

            const newUser = await userService.createUser(createParams);
            const requiresApproval = APPROVAL_REQUIRED_ROLES.includes(newUser.role);

            if (requiresApproval) {
                logger.info('User registration requires admin approval', { userId: newUser.id, role: newUser.role });
                // TODO: Trigger notification/task
            }
            // TODO: Trigger commission record

            logger.info('User registered successfully', { userId: newUser.id, email: newUser.email, role: newUser.role });
            return NextResponse.json({
                    message: 'User registered successfully.',
                    userId: newUser.id,
                    requiresApproval: requiresApproval,
                },{ status: 201 }
            );
        } catch (error: unknown) {
            logger.error('Registration failed', {}, error);
            if (error instanceof SyntaxError) {
                return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
            }
            if (errorMessage === 'Email already in use') {
                return NextResponse.json({ message: errorMessage }, { status: 409 });
            }
            return NextResponse.json({ message: 'Internal Server Error during registration.' }, { status: 500 });
        }
    }),
    {
        limit: rateLimits.auth.register.limit,
        window: rateLimits.auth.register.window,
    }
);
