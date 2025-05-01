import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

interface SuspendRequestBody {
  reason: string;
  setStatus?: 'Suspended' | 'Rejected';
}

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

    // Parse request body
    const body: SuspendRequestBody = await request.json().catch(() => ({}));

    if (!body.reason) {
      return NextResponse.json(
        { message: 'A reason is required for suspension/rejection' },
        { status: 400 }
      );
    }

    // Determine status to set (default to Suspended if not specified)
    const newStatus = body.setStatus || 'Suspended';
    

    // First, check if user exists and get their current status and role
    const userResult = await sql`
      SELECT id, status, role, email, name FROM users WHERE id = ${userId}
    `;

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userResult[0];

    // Don't allow suspending/rejecting admins
    if (user.role === 'Admin') {
      return NextResponse.json({ message: 'Cannot suspend/reject admin users' }, { status: 400 });
    }

    // Update user status
    await sql`
      UPDATE users 
      SET status = ${newStatus}, updated_at = NOW() 
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
        ${newStatus === 'Suspended' ? 'User Suspended' : 'User Rejected'},
        'User',
        ${userId},
        ${`${user.role} user ${newStatus.toLowerCase()} for reason: ${body.reason}`},
        NOW()
      )
    `;

    // Create user notification about the action
    await sql`
      INSERT INTO user_notifications (
        user_id,
        type,
        message,
        is_read,
        created_at
      ) VALUES (
        ${userId},
        ${newStatus === 'Suspended' ? 'Account Suspended' : 'Registration Rejected'},
        ${
          newStatus === 'Suspended'
            ? 'Your account has been suspended. Reason: ' + body.reason
            : 'Your registration was not approved. Reason: ' + body.reason
        },
        false,
        NOW()
      )
    `;

    // TODO: Send email notification
    }`
    );

    return NextResponse.json({
      message: `User ${userId} ${newStatus.toLowerCase()} successfully`,
      user: {
        id: userId,
        status: newStatus,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Admin: Failed to suspend/reject user ${userId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
