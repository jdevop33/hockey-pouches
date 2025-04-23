import { NextResponse, type NextRequest } from 'next/server';

export async function PUT(
    request: NextRequest, 
    { params }: { params: { inventoryId: string } } // Applying correct standard signature
) {
  const { inventoryId } = params;

  try {
    const body = await request.json();
    console.log(`Admin: Update inventory quantity for ID: ${inventoryId}`, body); 

    if (typeof body.quantity !== 'number' || body.quantity < 0) {
      return NextResponse.json({ message: 'Invalid quantity provided' }, { status: 400 });
    }

    // --- Update Inventory Logic Here ---

    return NextResponse.json({ message: `Inventory ${inventoryId} updated successfully` }); 

  } catch (error: any) {
     if (error instanceof SyntaxError) {
         return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
