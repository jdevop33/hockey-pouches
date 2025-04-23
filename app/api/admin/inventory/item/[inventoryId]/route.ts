import { NextResponse, type NextRequest } from 'next/server';

export async function PUT(
    request: NextRequest, 
    { params }: { params: { inventoryId: string } } // Friend's suggestion: Use destructuring
) {
  const { inventoryId } = params; // Extract via destructuring

  if (!inventoryId) {
    // This check is technically redundant if the signature works, but safe to keep
    return NextResponse.json({ message: 'Inventory ID is missing.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log(`Admin: Update inventory quantity for ID: ${inventoryId}`, body); // Placeholder

    if (typeof body.quantity !== 'number' || body.quantity < 0) {
      return NextResponse.json({ message: 'Invalid quantity provided' }, { status: 400 });
    }

    // --- Update Inventory Logic Here ---

    return NextResponse.json({ message: `Inventory ${inventoryId} updated successfully` }); // Placeholder

  } catch (error: any) {
     if (error instanceof SyntaxError) {
         return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
