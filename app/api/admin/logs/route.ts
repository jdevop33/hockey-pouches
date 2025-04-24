import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/admin/logs
 * Returns log history (development only)
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request);

  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin role
  if (authResult.role !== 'Admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Logs are only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level');

    // Get log history
    const logs = logger.getHistory();

    // Filter by level if specified
    const filteredLogs = level ? logs.filter(log => log.level === level) : logs;

    // Apply limit
    const limitedLogs = filteredLogs.slice(0, limit);

    return NextResponse.json({
      logs: limitedLogs,
      total: filteredLogs.length,
      limit,
    });
  } catch (error) {
    logger.error('Error retrieving logs', {}, error);
    return NextResponse.json({ message: 'Error retrieving logs' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/logs
 * Clears log history (development only)
 */
export async function DELETE(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth(request);

  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin role
  if (authResult.role !== 'Admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Logs are only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Clear log history
    logger.clearHistory();

    return NextResponse.json({ message: 'Logs cleared successfully' });
  } catch (error) {
    logger.error('Error clearing logs', {}, error);
    return NextResponse.json({ message: 'Error clearing logs' }, { status: 500 });
  }
}
