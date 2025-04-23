// app/api/admin/inventory/item/[inventoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Define the specific params type for this route as suggested
type ContextParams = {
  params: {
    inventoryId: string;
  };
};

// Ensure verifyAdmin and updateInventoryQuantity are properly defined elsewhere if used
// import { verifyAdmin } from '@/lib/auth'; 
// import { updateInventoryQuantity } from '@/lib/inventoryService'; 

export async function PUT(
  request: NextRequest,
  context: ContextParams // Using the suggested typed context parameter
) {
  // Extract inventoryId from context.params
  const inventoryId = context.params.inventoryId;
  
  // Optional check (good practice even if types work)
  if (!inventoryId) {
     return NextResponse.json({ message: 'Inventory ID is missing.' }, { status: 400 });
  }

  try {
    // --- Optional: Add Admin Authentication Verification Logic Here ---
    // const adminCheck = await verifyAdmin(request); 
    // if (!adminCheck.isAdmin) { 
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); 
    // }
    // const adminUserId = adminCheck.userId;

    const body = await request.json();
    console.log(`Admin: Update inventory quantity for ID: ${inventoryId}`, body); 

    // Input validation
    if (typeof body.quantity !== "number" || body.quantity < 0) {
      return NextResponse.json({ message: "Invalid quantity provided" }, { status: 400 });
    }

    // --- Actual Update Inventory Logic Here --- 
    // Example using a hypothetical function:
    // const updateResult = await updateInventoryQuantity(inventoryId, body.quantity, adminUserId, body.reason); // Pass reason if needed
    // if (!updateResult) {
    //   return NextResponse.json({ message: 'Inventory item not found or update failed' }, { status: 404 });
    // }
    // --- End Update Logic --- 

    return NextResponse.json({ message: `Inventory ${inventoryId} updated successfully` });

  } catch (error: any) {
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Note: If GET or other handlers exist in this file, they need the same signature: (request: NextRequest, context: ContextParams)
