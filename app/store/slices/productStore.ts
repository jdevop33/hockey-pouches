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
  id: string; // Should be number if it's product.id
  name: string;
  description?: string | null;
  price: number;
  images?: string[] | null; // Assuming image_url
  category?: string | null;
  variants?: ProductVariant[];
  stock: number; // This likely represents total stock across variations
  sku?: string | null; // Base SKU?
  flavor?: string | null;
  strength?: number | null;
  is_active?: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

// Extend the correct base state
export interface ProductState extends HydratedBaseState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getFilteredProducts: () => Product[];
}

// Define initial state separately
const initialState: Partial<ProductState> = {
  products: [],
  selectedProduct: null,
  filters: {},
};

// Creator function
const createProductSlice: StoreCreator<ProductState> = (set, get) => ({
  // Initial state handled by createHydratedStore
  setProducts: (products: Product[]) => set(() => ({ products })),
  setSelectedProduct: (product: Product | null) => set(() => ({ selectedProduct: product })),
  setFilters: (filters: Partial<ProductFilters>) =>
    set((state) => ({ // Correctly access state
      filters: { ...state.filters, ...filters },
    })),
  updateProduct: (id: string, updates: Partial<Product>) =>
    set((state) => ({ // Correctly access state
      products: state.products.map((product: Product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    })),
  getFilteredProducts: (): Product[] => {
    const { filters, products } = get(); // Use get() to access current state
    // Add null/undefined checks for filters
    return products.filter((product: Product) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.minPrice != null && product.price < filters.minPrice) return false;
      if (filters.maxPrice != null && product.price > filters.maxPrice) return false;
      if (filters.inStock && product.stock <= 0) return false;
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
  'product',
  createProductSlice
);
