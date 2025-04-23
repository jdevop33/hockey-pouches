import { NextResponse, type NextRequest } from 'next/server'; 

export async function GET(
  request: NextRequest, 
  { params }: { params: { productId: string } } // Friend's suggestion: Use destructuring
) {
  const { productId } = params; // Extract via destructuring

  if (!productId) {
    // This check is technically redundant if the signature works, but safe to keep
    return NextResponse.json({ message: 'Product ID is missing.' }, { status: 400 });
  }

  try {
    console.log(`Admin: Get inventory for product ID: ${productId}`);

    // Placeholder data
    const dummyProductInventory = [
      { inventoryId: 'inv-1', productId: productId, variationId: 'var-1', variationName: '12mg', location: 'Warehouse A', quantity: 150 },
      { inventoryId: 'inv-3', productId: productId, variationId: 'var-1', variationName: '12mg', location: 'Warehouse B', quantity: 300 },
      { inventoryId: 'inv-4', productId: productId, variationId: 'var-2', variationName: '6mg', location: 'Warehouse A', quantity: 200 },
    ];

    return NextResponse.json(dummyProductInventory);

  } catch (error) {
    console.error(`Admin: Failed to get inventory for product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
