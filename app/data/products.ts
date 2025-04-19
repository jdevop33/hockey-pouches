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
  'Mint',
  'Apple Mint',
  'Berry',
  'Citrus',
];

export const products: Product[] = [
  // Original products
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

  // Additional products from images folder
  {
    id: 7,
    name: 'Mint 12mg',
    flavor: 'Mint',
    strength: 12,
    description: 'Tobacco Free Nicotine Pouch, 12mg/pouch',
    imageUrl: '/images/products/mint/mint-12mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 8,
    name: 'Mint 6mg',
    flavor: 'Mint',
    strength: 6,
    description: 'Tobacco Free Nicotine Pouch, 6mg/pouch',
    imageUrl: '/images/products/mint/mint-6mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 9,
    name: 'Apple Mint 12mg',
    flavor: 'Apple Mint',
    strength: 12,
    description: 'Tobacco Free Nicotine Pouch, 12mg/pouch',
    imageUrl: '/images/products/apple-mint/apple-mint-12mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 10,
    name: 'Apple Mint 6mg',
    flavor: 'Apple Mint',
    strength: 6,
    description: 'Tobacco Free Nicotine Pouch, 6mg/pouch',
    imageUrl: '/images/products/apple-mint/apple-mint-6mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 11,
    name: 'Berry 12mg',
    flavor: 'Berry',
    strength: 12,
    description: 'Tobacco Free Nicotine Pouch, 12mg/pouch',
    imageUrl: '/images/products/berry/berry-12mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 12,
    name: 'Berry 6mg',
    flavor: 'Berry',
    strength: 6,
    description: 'Tobacco Free Nicotine Pouch, 6mg/pouch',
    imageUrl: '/images/products/berry/berry-6mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 13,
    name: 'Citrus 12mg',
    flavor: 'Citrus',
    strength: 12,
    description: 'Tobacco Free Nicotine Pouch, 12mg/pouch',
    imageUrl: '/images/products/citrus/citrus-12mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
  {
    id: 14,
    name: 'Citrus 6mg',
    flavor: 'Citrus',
    strength: 6,
    description: 'Tobacco Free Nicotine Pouch, 6mg/pouch',
    imageUrl: '/images/products/citrus/citrus-6mg.png',
    price: 15.0,
    compareAtPrice: 18.0,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
    ],
  },
];
