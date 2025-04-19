export interface PriceTier {
  quantity: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  flavor: string;
  strength: number;
  description: string;
  imageUrl: string;
  price: number; // Retail price
  compareAtPrice?: number; // Optional "was" price for sales
  wholesalePrices?: PriceTier[]; // Keep for reference but mark as optional
  bulkDiscounts?: { quantity: number; discountPercentage: number }[];
}

// Extract unique flavors from products
export const flavors: string[] = [
  'Cool Mint',
  'Peppermint',
  'Spearmint',
  'Watermelon',
  'Cola',
  'Cherry',
];

export const products: Product[] = [
  // Original products with valid images
  {
    id: 1,
    name: 'Cool Mint 22mg',
    flavor: 'Cool Mint',
    strength: 22,
    description: 'Tobacco Free Nicotine Pouch, 22mg/pouch',
    imageUrl: '/images/products/puxxcoolmint22mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0, // Optional "was" price to show savings
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 }, // 5% off for 3+ cans
      { quantity: 5, discountPercentage: 10 }, // 10% off for 5+ cans
      { quantity: 10, discountPercentage: 15 }, // 15% off for 10+ cans
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
  {
    id: 2,
    name: 'Peppermint 22mg',
    flavor: 'Peppermint',
    strength: 22,
    description: 'Tobacco Free Nicotine Pouch, 22mg/pouch',
    imageUrl: '/images/products/puxxperpermint22mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
  {
    id: 3,
    name: 'Spearmint 22mg',
    flavor: 'Spearmint',
    strength: 22,
    description: 'Tobacco Free Nicotine Pouch, 22mg/pouch',
    imageUrl: '/images/products/puxxspearmint22mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
  {
    id: 4,
    name: 'Watermelon 16mg',
    flavor: 'Watermelon',
    strength: 16,
    description: 'Tobacco Free Nicotine Pouch, 16mg/pouch',
    imageUrl: '/images/products/puxxwatermelon16mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
  {
    id: 5,
    name: 'Cola 16mg',
    flavor: 'Cola',
    strength: 16,
    description: 'Tobacco Free Nicotine Pouch, 16mg/pouch',
    imageUrl: '/images/products/puxxcola16mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
  {
    id: 6,
    name: 'Cherry 16mg',
    flavor: 'Cherry',
    strength: 16,
    description: 'Tobacco Free Nicotine Pouch, 16mg/pouch',
    imageUrl: '/images/products/puxcherry16mg-650x650.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.0 },
      { quantity: 500, price: 7.5 },
      { quantity: 1000, price: 7.0 },
      { quantity: 5000, price: 6.5 },
      { quantity: 10000, price: 6.0 },
    ],
  },
];
