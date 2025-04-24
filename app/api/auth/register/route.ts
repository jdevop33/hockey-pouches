import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sql from '@/lib/db'; // Using updated alias

// Basic interface for expected registration data
interface RegistrationBody {
  name?: string;
  email?: string;
  password?: string;
  referralCode?: string | null;
}

// Define a simple User type returned from DB (adjust based on actual query)
interface User {
  id: string; // Assuming UUID
  email: string;
}

export async function POST(request: Request) {
  try {
    const body: RegistrationBody = await request.json();
    const { name, email, password, referralCode } = body;

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
    if (referralCode && typeof referralCode !== 'string') {
      return NextResponse.json({ message: 'Invalid referral code format.' }, { status: 400 });
    }
    const referredBy = referralCode?.trim() || null;

    console.log('Registration attempt validation passed for:', lowerCaseEmail);

    // --- Database Operations ---

    // 1. Check if user already exists
    console.log('Checking for existing user...');
    // Removed the type argument from sql tag
    const existingUsers = await sql`SELECT id, email FROM users WHERE email = ${lowerCaseEmail}`;

    // We can assert the type on the result if needed for clarity, though length check often suffices
    if ((existingUsers as User[]).length > 0) {
      console.warn('User already exists:', lowerCaseEmail);
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      ); // 409 Conflict
    }
    console.log('User does not exist, proceeding...');

    // 2. Hash password
    console.log('Hashing password...');
    const saltRounds = 10; // Standard salt rounds
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed.');

    // 3. Validate referred_by_code if provided
    let referrerId = null;
    if (referredBy) {
      console.log(`Validating referral code: ${referredBy}`);
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referredBy}`;
      if (referrer.length === 0) {
        return NextResponse.json({ message: 'Invalid referral code.' }, { status: 400 });
      }
      referrerId = referrer[0].id;
      console.log(`Valid referral code from user ID: ${referrerId}`);
    }

    // 4. TODO: Generate a unique referral_code for the new user (e.g., base part of name + random chars)
    const newUserReferralCode = `${trimmedName.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    console.log(`Generated referral code: ${newUserReferralCode}`);

    // 5. Create user in DB
    console.log('Inserting new user into database...');
    const newUser = await sql`
        INSERT INTO users (name, email, password_hash, referred_by_code, referred_by_user_id, referral_code, role, status)
        VALUES (${trimmedName}, ${lowerCaseEmail}, ${passwordHash}, ${referredBy}, ${referrerId}, ${newUserReferralCode}, 'Retail Customer', 'Active')
        RETURNING id
    `;
    const newUserId = newUser[0].id;
    console.log('User inserted successfully:', lowerCaseEmail, 'with ID:', newUserId);

    // 6. Create referral commission record if referred by someone
    if (referrerId) {
      console.log('Creating referral commission record...');
      await sql`
            INSERT INTO commissions (user_id, type, amount, status, related_to, related_id, notes)
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
      console.log('Referral commission record created for referrer ID:', referrerId);
    }

    // --- Success Response ---
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (error: any) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    // Handle potential DB unique constraint errors (example check)
    if (
      error.message?.includes('duplicate key value violates unique constraint "users_email_key"')
    ) {
      console.warn('Conflict during insert (user likely registered concurrently): ', error.message);
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
      console.warn('Conflict during insert (referral code collision): ', error.message);
      // TODO: Retry with a new referral code? Or just fail for now?
      return NextResponse.json(
        { message: 'Internal server error during registration.' },
        { status: 500 }
      );
    }

    console.error('Registration failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
