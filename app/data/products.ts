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
  wholesalePrices: PriceTier[];
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
    wholesalePrices: [
      { quantity: 100, price: 8.00 },
      { quantity: 500, price: 7.50 },
      { quantity: 1000, price: 7.00 },
      { quantity: 5000, price: 6.50 },
      { quantity: 10000, price: 6.00 }
    ]
  }
];
