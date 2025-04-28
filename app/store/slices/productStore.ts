import { BaseState, createStore } from '../config';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  variants?: ProductVariant[];
  stock: number;
  sku: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductState extends BaseState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getFilteredProducts: () => Product[];
}

const initialState: Partial<ProductState> = {
  products: [],
  selectedProduct: null,
  filters: {},
};

export const useProductStore = createStore<ProductState>(
  {
    ...initialState,
    setProducts: (products: Product[]) => useProductStore.setState(() => ({ products })),
    setSelectedProduct: (product: Product | null) =>
      useProductStore.setState(() => ({ selectedProduct: product })),
    setFilters: (filters: Partial<ProductFilters>) =>
      useProductStore.setState((state: ProductState) => ({
        filters: { ...state.filters, ...filters },
      })),
    updateProduct: (id: string, updates: Partial<Product>) =>
      useProductStore.setState((state: ProductState) => ({
        products: state.products.map((product: Product) =>
          product.id === id ? { ...product, ...updates } : product
        ),
      })),
    getFilteredProducts: (): Product[] => {
      const { filters, products } = useProductStore.getState();
      return products.filter((product: Product) => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.minPrice && product.price < filters.minPrice) return false;
        if (filters.maxPrice && product.price > filters.maxPrice) return false;
        if (filters.inStock && product.stock <= 0) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    },
  },
  'product'
);
