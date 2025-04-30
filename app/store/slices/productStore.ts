// Import necessary types and the correct store creator
import { HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';

// TODO: Replace these with schema-derived types (ProductSelect, ProductVariationSelect)
export interface ProductVariant {
  id: string; // Should be number if it's productVariation.id
  name: string;
  price: number;
  sku: string;
  stock: number; // This likely represents calculated available stock
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  image_url?: string;
  flavor?: string;
  strength?: number;
  featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
  stock: number; // This likely represents total stock across variations
  sku?: string | null; // Base SKU?
  // Add any other properties your product might have
}

export interface ProductFilter {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  flavors?: string[] | null;
  strengths?: number[] | null;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity' | null;
  search?: string | null;
}

// Extend the correct base state
export interface ProductState extends HydratedBaseState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilter;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ProductFilter>) => void;
  toggleFeatured: (productId: string, featured: boolean) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getFilteredProducts: () => Product[];
}

// Define initial state separately
const initialState: Partial<ProductState> = {
  products: [],
  selectedProduct: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    flavors: null,
    strengths: null,
    sortBy: null,
    search: null,
  },
};

// Creator function
const createProductSlice: StoreCreator<ProductState> = (set, get) => ({
  setProducts: (products: Product[]) => set({ products }),

  setSelectedProduct: (product: Product | null) => set({ selectedProduct: product }),

  setFilters: (filters: Partial<ProductFilter>) =>
    set(state => ({
      filters: { ...state.filters, ...filters },
    })),

  toggleFeatured: (productId: string, featured: boolean) =>
    set(state => ({
      products: state.products.map((product: Product) =>
        product.id === productId ? { ...product, featured } : product
      ),
    })),

  updateProduct: (id: string, updates: Partial<Product>) =>
    set(state => ({
      products: state.products.map((product: Product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    })),

  getFilteredProducts: () => {
    const { filters, products } = get();
    // Add null/undefined checks for filters
    return products.filter((product: Product) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.minPrice != null && product.price < filters.minPrice) return false;
      if (filters.maxPrice != null && product.price > filters.maxPrice) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  },
});

// Use createHydratedStore
export const useProductStore = createHydratedStore<ProductState>(
  initialState,
  'products',
  createProductSlice
);
