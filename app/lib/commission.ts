// app/lib/commission.ts
import sql from '@/lib/db';
import { getRows } from '@/lib/db-types';

// Commission types
export type CommissionType = 'Order Referral' | 'Wholesale Referral' | 'Distributor Fulfillment';

// Commission status types
export type CommissionStatus = 'Pending' | 'Approved' | 'Paid' | 'Cancelled';

// Commission calculation result
export interface CommissionResult {
  success: boolean;
  commissionId?: string;
  amount?: number;
  message: string;
  error?: any;
}

/**
 * Calculate and create commission for an order referral
 * @param orderId The order ID
 * @param orderAmount The order amount
 * @param referralCode The referral code used
 * @returns CommissionResult with status and commission ID
 */
export async function calculateOrderReferralCommission(
  orderId: number,
  orderAmount: number,
  referralCode: string | null
): Promise<CommissionResult> {
  if (!referralCode) {
    return {
      success: false,
      message: 'No referral code provided',
    };
  }

  try {
    // Find the user who owns the referral code
    const referrerResult = await sql`
      SELECT id, name, email FROM users WHERE referral_code = ${referralCode}
    `;

    const referrerRows = getRows(referrerResult);
    if (referrerRows.length === 0) {
      return {
        success: false,
        message: `No user found with referral code: ${referralCode}`,
      };
    }

    const referrer = referrerRows[0];

    // Calculate commission amount (5% of order amount)
    const commissionRate = 0.05;
    const commissionAmount = orderAmount * commissionRate;

    // Round to 2 decimal places
    const roundedAmount = Math.round(commissionAmount * 100) / 100;

    // Create commission record
    const commissionResult = await sql`
      INSERT INTO commissions (
        user_id,
        amount,
        type,
        status,
        related_to,
        related_id,
        notes
      ) VALUES (
        ${referrer.id},
        ${roundedAmount},
        'Order Referral',
        'Pending',
        'Order',
        ${orderId},
        'Order referral commission'
      ) RETURNING id
    `;

    const commissionRows = getRows(commissionResult);
    const commissionId = commissionRows[0]?.id;

    if (!commissionId) {
      throw new Error('Failed to create commission record');
    }

    // Create a task for commission review
    await sql`
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        category,
        related_to,
        related_id
      ) VALUES (
        'Review referral commission',
        'Review and approve referral commission for order #${orderId}',
        'Pending',
        'Medium',
        'Commission',
        'Commission',
        ${commissionId}
      )
    `;

    return {
      success: true,
      commissionId,
      amount: roundedAmount,
      message: `Created referral commission of $${roundedAmount} for user ${referrer.name} (${referrer.email})`,
    };
  } catch (error) {
    console.error(`Failed to calculate referral commission for order ${orderId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error calculating commission',
      error,
    };
  }
}

/**
 * Calculate and create commission for a distributor fulfillment
 * @param orderId The order ID
 * @param orderAmount The order amount
 * @param distributorId The distributor user ID
 * @returns CommissionResult with status and commission ID
 */
export async function calculateDistributorFulfillmentCommission(
  orderId: number,
  orderAmount: number,
  distributorId: string
): Promise<CommissionResult> {
  try {
    // Verify the distributor exists
    const distributorResult = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${distributorId}
    `;

    const distributorRows = getRows(distributorResult);
    if (distributorRows.length === 0) {
      return {
        success: false,
        message: `No user found with ID: ${distributorId}`,
      };
    }

    const distributor = distributorRows[0];

    // Verify the user is a distributor
    if (distributor.role !== 'Distributor') {
      return {
        success: false,
        message: `User ${distributor.name} is not a distributor`,
      };
    }

    // Calculate commission amount (10% of order amount for fulfillment)
    const commissionRate = 0.1;
    const commissionAmount = orderAmount * commissionRate;

    // Round to 2 decimal places
    const roundedAmount = Math.round(commissionAmount * 100) / 100;

    // Create commission record
    const commissionResult = await sql`
      INSERT INTO commissions (
        user_id,
        amount,
        type,
        status,
        related_to,
        related_id,
        notes
      ) VALUES (
        ${distributorId},
        ${roundedAmount},
        'Distributor Fulfillment',
        'Pending',
        'Order',
        ${orderId},
        'Fulfillment commission'
      ) RETURNING id
    `;

    const commissionRows = getRows(commissionResult);
    const commissionId = commissionRows[0]?.id;

    if (!commissionId) {
      throw new Error('Failed to create commission record');
    }

    // Create a task for commission review
    await sql`
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        category,
        related_to,
        related_id
      ) VALUES (
        'Review fulfillment commission',
        'Review and approve fulfillment commission for order #${orderId}',
        'Pending',
        'Medium',
        'Commission',
        'Commission',
        ${commissionId}
      )
    `;

    return {
      success: true,
      commissionId,
      amount: roundedAmount,
      message: `Created fulfillment commission of $${roundedAmount} for distributor ${distributor.name}`,
    };
  } catch (error) {
    console.error(`Failed to calculate fulfillment commission for order ${orderId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error calculating commission',
      error,
    };
  }
}

/**
 * Cancel commissions for an order
 * @param orderId The order ID
 * @returns CommissionResult with status
 */
export async function cancelCommissionsForOrder(orderId: number): Promise<CommissionResult> {
  try {
    // Update all commissions related to this order to Cancelled
    const updateResult = await sql`
      UPDATE commissions
      SET status = 'Cancelled',
          updated_at = CURRENT_TIMESTAMP,
          notes = CONCAT(COALESCE(notes, ''), ' | Cancelled due to order cancellation')
      WHERE related_to = 'Order'
      AND related_id = ${orderId}
      AND status IN ('Pending', 'Approved')
    `;

    // Close any related tasks
    await sql`
      UPDATE tasks
      SET status = 'Cancelled',
          updated_at = CURRENT_TIMESTAMP,
          notes = CONCAT(COALESCE(notes, ''), ' | Cancelled due to order cancellation')
      WHERE category = 'Commission'
      AND related_to = 'Commission'
      AND related_id IN (
        SELECT id FROM commissions
        WHERE related_to = 'Order'
        AND related_id = ${orderId}
      )
      AND status = 'Pending'
    `;

    return {
      success: true,
      message: `Cancelled all pending commissions for order ${orderId}`,
    };
  } catch (error) {
    console.error(`Failed to cancel commissions for order ${orderId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error cancelling commissions',
      error,
    };
  }
}
