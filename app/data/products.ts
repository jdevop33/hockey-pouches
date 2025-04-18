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
  price: number;  // Retail price
  compareAtPrice?: number;  // Optional "was" price for sales
  wholesalePrices?: PriceTier[];  // Keep for reference but mark as optional
  bulkDiscounts?: {quantity: number, discountPercentage: number}[];
}

// Extract unique flavors from products
export const flavors: string[] = [
  "Apple mint",
  "Mint",
  "Citrus",
  "Berry"
];

export const products: Product[] = [
  {
    id: 1,
    name: "Apple mint 6mg",
    flavor: "Apple mint",
    strength: 6,
    description: "Tobacco Free Nicotine Pouch, 6mg/pouch",
    imageUrl: "/images/products/apple-mint/apple-mint-6mg.png",
    price: 15.00,
    compareAtPrice: 18.00,  // Optional "was" price to show savings
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },  // 5% off for 3+ cans
      { quantity: 5, discountPercentage: 10 }, // 10% off for 5+ cans
      { quantity: 10, discountPercentage: 15 } // 15% off for 10+ cans
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 2,
    name: "Apple mint 12mg",
    flavor: "Apple mint",
    strength: 12,
    description: "Tobacco Free Nicotine Pouch, 12mg/pouch",
    imageUrl: "/images/products/apple-mint/apple-mint-12mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 3,
    name: "Mint 6mg",
    flavor: "Mint",
    strength: 6,
    description: "Tobacco Free Nicotine Pouch, 6mg/pouch",
    imageUrl: "/images/products/mint/mint-6mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 4,
    name: "Mint 12mg",
    flavor: "Mint",
    strength: 12,
    description: "Tobacco Free Nicotine Pouch, 12mg/pouch",
    imageUrl: "/images/products/mint/mint-12mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 5,
    name: "Citrus 6mg",
    flavor: "Citrus",
    strength: 6,
    description: "Tobacco Free Nicotine Pouch, 6mg/pouch",
    imageUrl: "/images/products/citrus/citrus-6mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 6,
    name: "Citrus 12mg",
    flavor: "Citrus",
    strength: 12,
    description: "Tobacco Free Nicotine Pouch, 12mg/pouch",
    imageUrl: "/images/products/citrus/citrus-12mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 7,
    name: "Berry 6mg",
    flavor: "Berry",
    strength: 6,
    description: "Tobacco Free Nicotine Pouch, 6mg/pouch",
    imageUrl: "/images/products/berry/berry-6mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  },
  {
    id: 8,
    name: "Berry 12mg",
    flavor: "Berry",
    strength: 12,
    description: "Tobacco Free Nicotine Pouch, 12mg/pouch",
    imageUrl: "/images/products/berry/berry-12mg.png",
    price: 15.00,
    compareAtPrice: 18.00,
    bulkDiscounts: [
      { quantity: 3, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ],
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  }
];
