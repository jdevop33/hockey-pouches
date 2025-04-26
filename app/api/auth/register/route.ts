import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import sql from '@/lib/db'; // Using updated alias
import { withRateLimit, rateLimits, RateLimitWindow } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/csrf-server';

// Basic interface for expected registration data
interface RegistrationBody {
  name?: string;
  email?: string;
  password?: string;
  referralCode?: string | null;
  role?: string;
  birthDate?: string;
}

// Valid roles for user registration
const VALID_ROLES = ['Retail Customer', 'Distributor', 'Referral Partner'];

// Roles that require admin approval
const APPROVAL_REQUIRED_ROLES = ['Distributor', 'Referral Partner'];

// Define a simple User type returned from DB (adjust based on actual query)
interface User {
  id: string; // Assuming UUID
  email: string;
}

export const POST = withRateLimit(
  withCsrfProtection(async (request: NextRequest) => {
    try {
      const body: RegistrationBody = await request.json();
      const { name, email, password, referralCode, role = 'Retail Customer', birthDate } = body;

      // --- Input Validation ---
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
      }
      const trimmedName = name.trim();

      if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
      }
      const lowerCaseEmail = email.toLowerCase(); // Store emails consistently

      if (!password || typeof password !== 'string' || password.length < 8) {
        return NextResponse.json(
          { message: 'Password must be at least 8 characters long.' },
          { status: 400 }
        );
      }

      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json(
          { message: 'Invalid user role. Must be one of: ' + VALID_ROLES.join(', ') },
          { status: 400 }
        );
      }

      if (referralCode && typeof referralCode !== 'string') {
        return NextResponse.json({ message: 'Invalid referral code format.' }, { status: 400 });
      }
      const referredBy = referralCode?.trim() || null;

      // Birth date validation
      if (!birthDate) {
        return NextResponse.json({ message: 'Birth date is required.' }, { status: 400 });
      }

      // Check if birth date makes user at least 21 years old
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 21) {
        return NextResponse.json(
          { message: 'You must be at least 21 years old to register.' },
          { status: 400 }
        );
      }

      logger.info('Registration attempt validation passed', { email: lowerCaseEmail, role });

      // --- Database Operations ---

      // 1. Check if user already exists
      logger.debug('Checking for existing user', { email: lowerCaseEmail });
      // Removed the type argument from sql tag
      const existingUsers = await sql`SELECT id, email FROM users WHERE email = ${lowerCaseEmail}`;

      // We can assert the type on the result if needed for clarity, though length check often suffices
      if ((existingUsers as User[]).length > 0) {
        logger.warn('User already exists', { email: lowerCaseEmail });
        return NextResponse.json(
          { message: 'User with this email already exists.' },
          { status: 409 }
        ); // 409 Conflict
      }
      logger.debug('User does not exist, proceeding', { email: lowerCaseEmail });

      // 2. Hash password
      logger.debug('Hashing password');
      const saltRounds = 10; // Standard salt rounds
      const passwordHash = await bcrypt.hash(password, saltRounds);
      logger.debug('Password hashed');

      // 3. Validate referred_by_code if provided
      let referrerId = null;
      if (referredBy) {
        logger.debug('Validating referral code', { referralCode: referredBy });
        const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referredBy}`;
        if (referrer.length === 0) {
          return NextResponse.json({ message: 'Invalid referral code.' }, { status: 400 });
        }
        referrerId = referrer[0].id;
        logger.debug('Valid referral code', { referralCode: referredBy, referrerId });
      }

      // 4. Generate a unique referral_code for the new user
      const newUserReferralCode = `${trimmedName.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      logger.debug('Generated referral code', { referralCode: newUserReferralCode });

      // 5. Determine account status based on role
      const accountStatus = APPROVAL_REQUIRED_ROLES.includes(role) ? 'Pending Approval' : 'Active';

      // 6. Create user in DB
      logger.debug('Inserting new user into database', {
        email: lowerCaseEmail,
        role,
        status: accountStatus,
      });
      const newUser = await sql`
        INSERT INTO users (
          name, 
          email, 
          password_hash, 
          referred_by_code, 
          referred_by_user_id, 
          referral_code, 
          role, 
          status, 
          birth_date
        )
        VALUES (
          ${trimmedName}, 
          ${lowerCaseEmail}, 
          ${passwordHash}, 
          ${referredBy}, 
          ${referrerId}, 
          ${newUserReferralCode}, 
          ${role}, 
          ${accountStatus},
          ${birthDate}
        )
        RETURNING id
      `;
      const newUserId = newUser[0].id;
      logger.info('User inserted successfully', {
        email: lowerCaseEmail,
        userId: newUserId,
        role,
        status: accountStatus,
      });

      // 7. Create referral commission record if referred by someone
      if (referrerId) {
        logger.debug('Creating referral commission record', { referrerId, newUserId });
        await sql`
          INSERT INTO commissions (
            user_id, 
            type, 
            amount, 
            status, 
            related_to, 
            related_id, 
            notes
          )
          VALUES (
            ${referrerId},
            'New Referral',
            0,
            'Pending',
            'User',
            ${newUserId},
            'New user referral bonus pending first purchase'
          )
        `;
        logger.debug('Referral commission record created', { referrerId, newUserId });
      }

      // 8. Create admin notification for approval if needed
      if (APPROVAL_REQUIRED_ROLES.includes(role)) {
        await sql`
          INSERT INTO admin_notifications (
            type,
            message,
            related_to,
            related_id,
            is_read,
            created_at
          )
          VALUES (
            'User Approval Required',
            ${`New ${role} account registration requires approval: ${trimmedName} (${lowerCaseEmail})`},
            'User',
            ${newUserId},
            false,
            NOW()
          )
        `;
        logger.debug('Admin notification created for account approval', {
          userId: newUserId,
          role,
        });
      }

      // --- Success Response ---
      return NextResponse.json(
        {
          message: 'User registered successfully.',
          requiresApproval: APPROVAL_REQUIRED_ROLES.includes(role),
        },
        { status: 201 }
      );
    } catch (error: any) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
      }
      // Handle potential DB unique constraint errors (example check)
      if (
        error.message?.includes('duplicate key value violates unique constraint "users_email_key"')
      ) {
        logger.warn(
          'Conflict during insert (user likely registered concurrently)',
          { error: 'Duplicate email' },
          error
        );
        return NextResponse.json(
          { message: 'User with this email already exists.' },
          { status: 409 }
        );
      }
      if (
        error.message?.includes(
          'duplicate key value violates unique constraint "users_referral_code_key"'
        )
      ) {
        logger.warn(
          'Conflict during insert (referral code collision)',
          { error: 'Duplicate referral code' },
          error
        );
        // TODO: Retry with a new referral code? Or just fail for now?
        return NextResponse.json(
          { message: 'Internal server error during registration.' },
          { status: 500 }
        );
      }

      logger.error('Registration failed', {}, error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }),
  {
    limit: rateLimits.auth.register.limit,
    window: rateLimits.auth.register.window,
  }
);
