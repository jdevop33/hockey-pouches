import { adminClient, storeClient } from '../medusa-client';
import { z } from 'zod';

// Type definitions for wholesale functionality
interface WholesaleCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  metadata?: {
    is_wholesale_applicant?: boolean;
    is_wholesale_approved?: boolean;
    is_wholesale_rejected?: boolean;
    company_name?: string;
    tax_id?: string;
    business_address?: string;
    estimated_order_size?: number;
    application_date?: string;
    approval_date?: string;
    rejection_date?: string;
    rejection_reason?: string;
  };
  [key: string]: any;
}

interface CustomerGroup {
  id: string;
  name: string;
  [key: string]: any;
}

// Minimum unit threshold for wholesale accounts
const WHOLESALE_MIN_UNITS = 100;

// Validation schema for wholesale application
export const wholesaleApplicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  business_address: z.string().min(1, 'Business address is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().min(1, 'Contact phone is required'),
  estimated_order_size: z
    .number()
    .int()
    .min(
      WHOLESALE_MIN_UNITS,
      `Wholesale accounts require a minimum order size of ${WHOLESALE_MIN_UNITS} units`
    ),
});

// Validation schema for wholesale orders
export const wholesaleOrderSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string(),
      variant_id: z.string().optional(),
      quantity: z.number().int(),
    })
  ),
  // Total order quantity must be at least WHOLESALE_MIN_UNITS
  total_quantity: z
    .number()
    .int()
    .min(
      WHOLESALE_MIN_UNITS,
      `Wholesale orders require a minimum of ${WHOLESALE_MIN_UNITS} total units`
    ),
});

// Helper function for creating and managing customer groups since they might not be available directly
const customerGroupsHelper = {
  async list(params: { name: string }) {
    // If customerGroups exists on the adminClient, use it
    if ('customerGroups' in adminClient) {
      return (adminClient as any).customerGroups.list(params);
    }

    // Otherwise use the customers API to filter by group name
    // This is a fallback that may not work exactly the same
    const { customers } = await adminClient.customers.list({
      // Using metadata to filter by group name
      metadata: { customer_group_name: params.name },
    });

    // Return a simulated response format
    return {
      customer_groups:
        customers.length > 0
          ? [{ id: `group_${params.name.toLowerCase().replace(/\s+/g, '_')}`, name: params.name }]
          : [],
    };
  },

  async create(params: { name: string }) {
    // If customerGroups exists on the adminClient, use it
    if ('customerGroups' in adminClient) {
      return (adminClient as any).customerGroups.create(params);
    }

    // Otherwise create a customer with metadata indicating it's a group
    const { customer } = await adminClient.customers.create({
      email: `group-${params.name.toLowerCase().replace(/\s+/g, '_')}@example.com`,
      first_name: 'Group',
      last_name: params.name,
      metadata: {
        is_customer_group: true,
        customer_group_name: params.name,
      },
    });

    // Return a simulated response format
    return {
      customer_group: {
        id: `group_${params.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: params.name,
      },
    };
  },

  async addCustomers(groupId: string, params: { customer_ids: string[] }) {
    // If customerGroups exists on the adminClient, use it
    if ('customerGroups' in adminClient) {
      return (adminClient as any).customerGroups.addCustomers(groupId, params);
    }

    // Otherwise update each customer with metadata
    for (const customerId of params.customer_ids) {
      await adminClient.customers.update(customerId, {
        metadata: {
          customer_group_id: groupId,
        },
      });
    }

    // Return a simulated response
    return { success: true };
  },
};

export const wholesaleService = {
  // Submit a wholesale account application
  submitApplication: async (applicationData: Record<string, any>) => {
    try {
      // Validate application data
      const validatedData = wholesaleApplicationSchema.parse(applicationData);

      // Create customer with wholesale metadata
      const { customer } = await adminClient.customers.create({
        email: validatedData.contact_email,
        first_name: validatedData.contact_name.split(' ')[0],
        last_name: validatedData.contact_name.split(' ').slice(1).join(' ') || '-',
        phone: validatedData.contact_phone,
        metadata: {
          is_wholesale_applicant: true,
          is_wholesale_approved: false,
          company_name: validatedData.company_name,
          tax_id: validatedData.tax_id,
          business_address: validatedData.business_address,
          estimated_order_size: validatedData.estimated_order_size,
          application_date: new Date().toISOString(),
        },
      });

      return {
        success: true,
        customer,
        message: 'Wholesale application submitted successfully. Approval pending.',
      };
    } catch (error) {
      console.error('Failed to submit wholesale application:', error);
      throw error;
    }
  },

  // List pending wholesale applications for admin
  listPendingApplications: async () => {
    try {
      const { customers } = await adminClient.customers.list({
        metadata: {
          is_wholesale_applicant: 'true',
          is_wholesale_approved: 'false',
        },
      });

      return customers as WholesaleCustomer[];
    } catch (error) {
      console.error('Failed to list pending wholesale applications:', error);
      throw error;
    }
  },

  // Approve a wholesale application
  approveApplication: async (customerId: string) => {
    try {
      // Update customer metadata to mark as approved
      const { customer } = await adminClient.customers.update(customerId, {
        metadata: {
          is_wholesale_approved: true,
          approval_date: new Date().toISOString(),
        },
      });

      // Create a customer group for wholesale if it doesn't exist
      // and add this customer to the group
      let wholesaleGroup: CustomerGroup;

      try {
        const { customer_groups } = await customerGroupsHelper.list({
          name: 'Wholesale',
        });

        if (customer_groups.length === 0) {
          const { customer_group } = await customerGroupsHelper.create({
            name: 'Wholesale',
          });
          wholesaleGroup = customer_group;
        } else {
          wholesaleGroup = customer_groups[0];
        }

        // Add customer to wholesale group
        await customerGroupsHelper.addCustomers(wholesaleGroup.id, {
          customer_ids: [customerId],
        });
      } catch (groupError) {
        console.error('Error managing customer groups:', groupError);
        // Continue with approval even if group management fails
      }

      return {
        success: true,
        customer,
        message: 'Wholesale application approved successfully.',
      };
    } catch (error) {
      console.error(`Failed to approve wholesale application for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Reject a wholesale application
  rejectApplication: async (customerId: string, reason: string) => {
    try {
      // Update customer metadata to mark as rejected
      const { customer } = await adminClient.customers.update(customerId, {
        metadata: {
          is_wholesale_approved: false,
          is_wholesale_rejected: true,
          rejection_reason: reason,
          rejection_date: new Date().toISOString(),
        },
      });

      return {
        success: true,
        customer,
        message: 'Wholesale application rejected.',
      };
    } catch (error) {
      console.error(`Failed to reject wholesale application for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Check if a customer has wholesale status
  checkWholesaleStatus: async (customerId: string) => {
    try {
      const { customer } = await adminClient.customers.retrieve(customerId);
      const typedCustomer = customer as WholesaleCustomer;

      return {
        is_wholesale_applicant: typedCustomer.metadata?.is_wholesale_applicant === true,
        is_wholesale_approved: typedCustomer.metadata?.is_wholesale_approved === true,
        is_wholesale_rejected: typedCustomer.metadata?.is_wholesale_rejected === true,
        application_date: typedCustomer.metadata?.application_date,
        approval_date: typedCustomer.metadata?.approval_date,
        rejection_date: typedCustomer.metadata?.rejection_date,
        rejection_reason: typedCustomer.metadata?.rejection_reason,
      };
    } catch (error) {
      console.error(`Failed to check wholesale status for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Validate a wholesale order meets minimum requirements
  validateWholesaleOrder: (orderItems: Array<{ quantity: number }>) => {
    // Calculate total quantity across all items
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Check if total meets wholesale minimum
    if (totalQuantity < WHOLESALE_MIN_UNITS) {
      return {
        valid: false,
        message: `Wholesale orders require a minimum of ${WHOLESALE_MIN_UNITS} total units. Current total: ${totalQuantity}`,
      };
    }

    return { valid: true, totalQuantity };
  },
};
