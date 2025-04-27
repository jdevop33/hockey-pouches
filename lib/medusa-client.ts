import { createClient } from '@medusajs/js-sdk';

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

// Initialize the Medusa client for frontend usage
export const medusaClient = createClient({
  baseUrl,
  maxRetries: 3,
});

// Store client for customer-facing operations
export const storeClient = {
  products: medusaClient.store.product,
  collections: medusaClient.store.collection,
  regions: medusaClient.store.region,
  cart: medusaClient.store.cart,
  orders: medusaClient.store.order,
  returns: medusaClient.store.return,
  auth: medusaClient.auth,
  customers: medusaClient.store.customer,
};

// Admin client for admin dashboard operations
export const adminClient = {
  auth: medusaClient.auth,
  products: medusaClient.admin.product,
  collections: medusaClient.admin.collection,
  orders: medusaClient.admin.order,
  customers: medusaClient.admin.customer,
  users: medusaClient.admin.user,
  inventory: medusaClient.admin.inventory,
  discounts: medusaClient.admin.discount,
  regions: medusaClient.admin.region,
  shippingOptions: medusaClient.admin.shippingOption,
};

// Helper to ensure authentication for admin routes
export const requireAdminAuth = async () => {
  try {
    // Check if the user is authenticated as an admin
    await adminClient.auth.getSession('admin');
    return true;
  } catch (error) {
    return false;
  }
};

// Helper to ensure authentication for customer routes
export const requireCustomerAuth = async () => {
  try {
    // Check if the user is authenticated as a customer
    await storeClient.auth.getSession('customer');
    return true;
  } catch (error) {
    return false;
  }
};
