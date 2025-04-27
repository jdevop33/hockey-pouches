import { NextRequest, NextResponse } from 'next/server';
import { wholesaleService } from '../../../../../lib/services/wholesale-service';
import { requireAdminAuth } from '../../../../../lib/medusa-client';

// GET - List all pending wholesale applications
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const isAuthorized = await requireAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending applications
    const applications = await wholesaleService.listPendingApplications();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching wholesale applications:', error);
    return NextResponse.json({ error: 'Failed to fetch wholesale applications' }, { status: 500 });
  }
}
