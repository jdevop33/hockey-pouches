// app/types/index.ts
// Shared type definitions for the application

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  referral_code?: string | null;
  referred_by_code?: string | null;
  created_at: string;
  updated_at?: string | null;
  last_login?: string | null;
  location?: string | null;
}

export type UserRole = 'Admin' | 'Distributor' | 'Retail Customer' | 'Wholesale Buyer';
export type UserStatus = 'Active' | 'Suspended' | 'Pending Verification';

// Product types
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  flavor?: string | null;
  strength?: number | null;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_active: boolean;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  tracking_number?: string | null;
  notes?: string | null;
  assigned_distributor_id?: string | null;
}

export type OrderStatus = 
  | 'Pending Approval' 
  | 'Awaiting Fulfillment' 
  | 'Pending Fulfillment Verification'
  | 'Awaiting Shipment' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Refunded' 
  | 'On Hold - Stock Issue';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price_per_item: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// Commission types
export interface Commission {
  id: string;
  user_id: string;
  order_id?: string | null;
  type: CommissionType;
  amount: number;
  status: CommissionStatus;
  earned_date: string;
  payout_date?: string | null;
  payout_batch_id?: string | null;
}

export type CommissionType = 'Referral Sale' | 'Fulfillment' | 'Wholesale Referral' | 'Bonus';
export type CommissionStatus = 'Pending Payout' | 'Paid' | 'Cancelled';

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: TaskStatus;
  priority?: TaskPriority | null;
  assigned_user_id: string;
  due_date?: string | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  created_at: string;
  created_by_user_id?: string | null;
  completed_at?: string | null;
  completed_by_user_id?: string | null;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Inventory types
export interface Inventory {
  id: number;
  product_id: number;
  location: string;
  quantity: number;
  updated_at: string;
}

// Pagination type
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
