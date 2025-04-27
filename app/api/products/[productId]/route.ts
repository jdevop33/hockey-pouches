import { NextRequest, NextResponse } from 'next/server';
import { storeProductService } from '../../../../lib/services/product-service';

// GET product by ID
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await storeProductService.get(productId);

    // Return product with fixed price
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
