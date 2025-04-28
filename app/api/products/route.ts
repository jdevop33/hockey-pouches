import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample product data
    const products = [
      {
        id: 1,
        name: 'Hockey Pouch - Apple Mint',
        description: 'Refreshing apple mint flavored hockey pouch',
        flavor: 'Apple Mint',
        strength: 6,
        price: 19.99,
        compare_at_price: 24.99,
        image_url: '/images/products/apple-mint/pouch-front.jpg',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 2,
        name: 'Hockey Pouch - Berry Blast',
        description: 'Intense berry flavored hockey pouch',
        flavor: 'Berry Blast',
        strength: 12,
        price: 22.99,
        compare_at_price: null,
        image_url: '/images/products/berry-blast.jpg',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 3,
        name: 'Hockey Pouch - Mint Chill',
        description: 'Cooling mint flavored hockey pouch',
        flavor: 'Mint',
        strength: 9,
        price: 20.99,
        compare_at_price: null,
        image_url: '/images/products/mint-chill.jpg',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 4,
        name: 'Hockey Pouch - Coffee Kick',
        description: 'Rich coffee flavored hockey pouch for an energizing experience',
        flavor: 'Coffee',
        strength: 15,
        price: 24.99,
        compare_at_price: 27.99,
        image_url: '/images/products/coffee-kick.jpg',
        category: 'Nicotine Pouches',
        is_active: true,
      },
    ];

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
