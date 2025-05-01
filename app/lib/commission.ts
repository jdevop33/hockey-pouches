// app/lib/commission.ts
import { db, sql } from './db';
import { getRows, type DbRow } from './db-types'; // Import DbRow for type safety
import { logger } from './logger'; // Use logger

// Commission types
export type CommissionType = 'Order Referral' | 'Wholesale Referral' | 'Distributor Fulfillment';

// Commission status types
export type CommissionStatus = 'Pending' | 'Approved' | 'Paid' | 'Cancelled';

// Commission calculation result
export interface CommissionResult {
  success: boolean;
  commissionId?: string; // Commission ID is UUID string
  amount?: number;
  message: string;
  error?: unknown;
}

// Define expected row structure for user query
interface UserRow extends DbRow {
    id: string;
    name: string | null;
    email: string;
}

// Define expected row structure for commission insert
interface CommissionInsertRow extends DbRow {
    id: string; // Expecting UUID string
}

/**
 * Calculate and create commission for an order with a referral code
 * @param orderId The order ID (assuming it's a string UUID now based on schema)
 * @param orderAmount The order amount
 * @param referralCode The referral code used (if any)
 * @returns CommissionResult with status and commission ID
 */
export async function calculateOrderReferralCommission(
  orderId: string,
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
    logger.info('Calculating order referral commission', { orderId, referralCode });
    // Find the user who owns the referral code
    const referrerResult = await db.execute(sql`
      SELECT id, name, email FROM users WHERE referral_code = ${referralCode}
    `);

    const referrerRows = getRows(referrerResult) as UserRow[];
    if (Array.isArray(referrerRows) ? Array.isArray(referrerRows) ? referrerRows.length : 0 : 0 === 0) {
      logger.warn('Referrer user not found by code', { orderId, referralCode });
      return {
        success: false,
        message: `No user found with referral code: ${referralCode}`,
      };
    }

    const referrer = Array.isArray(referrerRows) ? Array.isArray(referrerRows) ? referrerRows[0] : null : null;

    // TODO: Get commission rate from referrer user record or config
    const commissionRate = 0.05; // Placeholder 5%
    const commissionAmount = orderAmount * commissionRate;

    const roundedAmount = Math.round(commissionAmount * 100) / 100;
    if (roundedAmount <= 0) {
         logger.info('Calculated referral commission is zero or less, skipping creation', { orderId, referrerId: String(referrer.id), amount: roundedAmount });
         return { success: true, message: 'Calculated commission is zero or less.' }; // Success, but no commission created
    }

    // Create commission record
    const commissionResult = await db.execute(sql`
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
        'OrderReferral', -- Use specific type from schema enum if available
        'Pending',     -- Use specific type from schema enum if available
        'Order',       -- Use specific type from schema enum if available
        ${orderId},
        ${`Order referral commission for order ${orderId}`}
      ) RETURNING id
    `);

    const commissionRows = getRows(commissionResult) as CommissionInsertRow[];
    // Ensure commissionId is treated as string (UUID)
    const commissionId = Array.isArray(commissionRows) ? Array.isArray(commissionRows) ? commissionRows[0] : null : null?.id;

    if (!commissionId) {
      logger.error('Failed to create commission record after insert', { orderId, referrerId: referrer.id });
      throw new Error('Failed to create commission record');
    }

    // TODO: Create task using TaskService or insert directly using schema enums
    // await taskService.createTask({ ...task details... });
    logger.info('Order referral commission created', { orderId, commissionId, referrerId: String(referrer.id), amount: roundedAmount });

    return {
      success: true,
      commissionId: String(commissionId), // Return the string ID
      amount: roundedAmount,
      message: `Created referral commission of $${roundedAmount} for user ${referrer.name} (${referrer.email})`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Failed to calculate referral commission for order ${orderId}:`, { error });
    return {
      success: false,
      message: error instanceof Error ? errorMessage : 'Unknown error calculating commission',
      error,
    };
  }
}

/**
 * Calculate and create commission for a distributor fulfillment
 * @param orderId The order ID (string UUID)
 * @param orderAmount The order amount
 * @param distributorId The distributor user ID
 * @returns CommissionResult with status and commission ID
 */
export async function calculateDistributorFulfillmentCommission(
  orderId: string,
  orderAmount: number,
  distributorId: string
): Promise<CommissionResult> {
  try {
    logger.info('Calculating distributor fulfillment commission', { orderId, distributorId });
    // Verify the distributor exists
    const distributorResult = await db.execute(sql`
      SELECT id, name, email, role FROM users WHERE id = ${distributorId}
    `);

    const distributorRows = getRows(distributorResult) as (UserRow & { role: string })[];
    if (Array.isArray(distributorRows) ? Array.isArray(distributorRows) ? distributorRows.length : 0 : 0 === 0) {
      logger.warn('Distributor user not found', { orderId, distributorId });
      return {
        success: false,
        message: `No user found with ID: ${distributorId}`,
      };
    }

    const distributor = Array.isArray(distributorRows) ? Array.isArray(distributorRows) ? distributorRows[0] : null : null;

    // Verify the user is a distributor
    if (distributor.role !== 'Distributor') {
      logger.warn('User is not a distributor, cannot assign fulfillment commission', { orderId, distributorId, role: distributor.role });
      return {
        success: false,
        message: `User ${distributor.name} is not a distributor`,
      };
    }

    // TODO: Get commission rate from distributor user record or config
    const commissionRate = 0.1; // Placeholder 10%
    const commissionAmount = orderAmount * commissionRate;

    const roundedAmount = Math.round(commissionAmount * 100) / 100;
     if (roundedAmount <= 0) {
         logger.info('Calculated fulfillment commission is zero or less, skipping creation', { orderId, distributorId, amount: roundedAmount });
         return { success: true, message: 'Calculated commission is zero or less.' }; // Success, but no commission created
    }

    // Create commission record
    const commissionResult = await db.execute(sql`
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
        'DistributorFulfillment', -- Use specific type from schema enum if available
        'Pending',
        'Order',
        ${orderId},
        ${`Fulfillment commission for order ${orderId}`}
      ) RETURNING id
    `);

    const commissionRows = getRows(commissionResult) as CommissionInsertRow[];
    const commissionId = Array.isArray(commissionRows) ? Array.isArray(commissionRows) ? commissionRows[0] : null : null?.id;

    if (!commissionId) {
      logger.error('Failed to create fulfillment commission record after insert', { orderId, distributorId });
      throw new Error('Failed to create commission record');
    }

    // TODO: Create task using TaskService or insert directly using schema enums
    logger.info('Distributor fulfillment commission created', { orderId, commissionId, distributorId, amount: roundedAmount });

    return {
      success: true,
      commissionId: String(commissionId), // Return string ID
      amount: roundedAmount,
      message: `Created fulfillment commission of $${roundedAmount} for distributor ${distributor.name}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Failed to calculate fulfillment commission for order ${orderId}:`, { error });
    return {
      success: false,
      message: error instanceof Error ? errorMessage : 'Unknown error calculating commission',
      error,
    };
  }
}

/**
 * Cancel all commissions associated with an order
 * @param orderId The order ID (string UUID)
 * @returns CommissionResult indicating success/failure
 */
export async function cancelCommissionsForOrder(orderId: string): Promise<CommissionResult> {
  try {
    logger.info('Cancelling commissions for order', { orderId });
    // Update commission status to Cancelled
    const updateResult = await db.execute(sql`
      UPDATE commissions
      SET status = 'Cancelled', -- Use specific type from schema enum if available
          updated_at = NOW(),
          notes = CONCAT(notes, ' | Cancelled due to order change/cancellation')
      WHERE related_to = 'Order'
        AND related_id = ${orderId}
        AND status = 'Pending' -- Only cancel pending ones
      RETURNING id
    `);

    // Drizzle returns a result object, not just rows. Check rowCount.
    const cancelledCount = updateResult.rowCount ?? 0;

    // TODO: Cancel any associated tasks using TaskService or update directly
    logger.info(`Cancelled ${cancelledCount} pending commissions for order`, { orderId });

    return {
      success: true,
      message: `Cancelled ${cancelledCount} pending commissions for order #${orderId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Failed to cancel commissions for order ${orderId}:`, { error });
    return {
      success: false,
      message: error instanceof Error ? errorMessage : 'Unknown error cancelling commissions',
      error,
    };
  }
}
