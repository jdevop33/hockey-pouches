import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    // Verify admin access
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAuthenticated || !adminCheck.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (adminCheck.role !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log(`Admin: Activate user request for ID: ${userId}`);

    // First, check if user exists and get their current status and role
    const userResult = await sql`
      SELECT id, status, role FROM users WHERE id = ${userId}
    `;

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    // Check if the user is in a state that can be activated
    if (user.status !== 'Pending Approval' && user.status !== 'Suspended') {
      return NextResponse.json(
        { message: `Cannot activate user with status: ${user.status}` },
        { status: 400 }
      );
    }

    // Update user status to Active
    await sql`
      UPDATE users 
      SET status = 'Active', updated_at = NOW() 
      WHERE id = ${userId}
    `;

    // Log the action in admin activity log
    await sql`
      INSERT INTO admin_logs (
        admin_id, 
        action, 
        related_to, 
        related_id, 
        details,
        created_at
      ) VALUES (
        ${adminCheck.userId},
        'User Activated',
        'User',
        ${userId},
        ${`User with role ${user.role} activated from ${user.status} status`},
        NOW()
      )
    `;

    // If user was pending approval, send them a notification email
    if (user.status === 'Pending Approval') {
      // TODO: Add email notification logic here
      console.log(`Email notification logic would go here for approved user ${userId}`);

      // Create user notification
      await sql`
        INSERT INTO user_notifications (
          user_id,
          type,
          message,
          is_read,
          created_at
        ) VALUES (
          ${userId},
          'Account Approved',
          'Your account has been approved! You can now log in and access all features.',
          false,
          NOW()
        )
      `;
    }

    return NextResponse.json({
      message: `User ${userId} activated successfully`,
      user: {
        id: userId,
        status: 'Active',
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Admin: Failed to activate user ${userId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
