import { NextRequest, NextResponse } from 'next/server';
import { mockProductsData } from '../../../api/mockData';

interface Product {
  id: number;
  name: string;
  flavor?: string;
  strength?: number;
  price: number;
  image_url?: string;
  category?: string;
  description?: string;
  is_active: boolean;
}

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = parseInt(params.productId);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // For now, use mock data - later replace with database call
    const product = mockProductsData.find((p: Product) => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}
