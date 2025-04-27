import { defineConfig } from '@medusajs/medusa/dist/types/config';

export default defineConfig({
  projectConfig: {
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:3000',
    },
    // Store public URL
    storeUrl: process.env.STORE_URL || 'http://localhost:3000',
    // Admin dashboard URL
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3000/admin',
  },
  // Required features for the Hockey Pouches application
  modules: [
    {
      resolve: '@medusajs/product',
      options: {
        enableUI: true,
      },
    },
    {
      resolve: '@medusajs/inventory',
      options: {
        enableUI: true,
      },
    },
    {
      resolve: '@medusajs/order',
      options: {
        enableUI: true,
      },
    },
    {
      resolve: '@medusajs/user',
      options: {
        enableUI: true,
      },
    },
    {
      resolve: '@medusajs/customer',
      options: {
        enableUI: true,
      },
    },
    {
      resolve: '@medusajs/payment',
      options: {
        enableUI: true,
      },
    },
  ],
  // Additional plugins, if needed
  plugins: [],
});
