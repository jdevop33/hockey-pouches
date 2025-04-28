import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample product data with correct image paths
    const products = [
      {
        id: 1,
        name: 'Hockey Pouch - Apple Mint',
        description: 'Refreshing apple mint flavored hockey pouch',
        flavor: 'Apple Mint',
        strength: 6,
        price: 19.99,
        compare_at_price: 24.99,
        image_url: '/images/products/apple-mint/apple-mint-6mg.png',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 2,
        name: 'Hockey Pouch - Cool Mint',
        description: 'Cooling mint flavored hockey pouch',
        flavor: 'Cool Mint',
        strength: 6,
        price: 22.99,
        compare_at_price: null,
        image_url: '/images/products/cool-mint-6mg.png',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 3,
        name: 'Hockey Pouch - Spearmint',
        description: 'Refreshing spearmint flavored hockey pouch',
        flavor: 'Spearmint',
        strength: 22,
        price: 20.99,
        compare_at_price: null,
        image_url: '/images/products/puxxspearmint22mg.png',
        category: 'Nicotine Pouches',
        is_active: true,
      },
      {
        id: 4,
        name: 'Hockey Pouch - Cola',
        description: 'Rich cola flavored hockey pouch for a refreshing experience',
        flavor: 'Cola',
        strength: 16,
        price: 24.99,
        compare_at_price: 27.99,
        image_url: '/images/products/puxxcola16mg.png',
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
