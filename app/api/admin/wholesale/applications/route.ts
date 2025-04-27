import { NextRequest, NextResponse } from 'next/server';

// GET - List all pending wholesale applications
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper admin authentication once we create our auth service
    // For now, we'll assume the request is authorized

    // TODO: Fetch actual pending applications once we implement our custom service
    // For now, return mock data
    const mockApplications = [
      {
        id: 'cust_001',
        company_name: 'Hockey Pro Supplies',
        tax_id: '123456789',
        contact_name: 'John Smith',
        contact_email: 'john@hockeypro.com',
        application_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        estimated_order_size: 150,
      },
      {
        id: 'cust_002',
        company_name: 'Rink Equipment Co.',
        tax_id: '987654321',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah@rinkequip.com',
        application_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        estimated_order_size: 200,
      },
    ];

    return NextResponse.json({ applications: mockApplications });
  } catch (error) {
    console.error('Error fetching wholesale applications:', error);
    return NextResponse.json({ error: 'Failed to fetch wholesale applications' }, { status: 500 });
  }
}
