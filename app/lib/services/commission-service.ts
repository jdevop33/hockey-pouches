import sql from '@/lib/db';
import { getRows } from '@/lib/db-types';

// Commission types
export type CommissionType = 'Order Referral' | 'Wholesale Referral' | 'Distributor Fulfillment';

// Commission status types
export type CommissionStatus = 'Pending' | 'Approved' | 'Paid' | 'Cancelled';

// Commission interface
export interface Commission {
  id: string;
  user_id: string;
  amount: number;
  type: CommissionType;
  status: CommissionStatus;
  related_to: string;
  related_id: string | number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string | null;
  payout_batch_id?: string | null;
}

/**
 * Service for commission-related operations
 */
export class CommissionService {
  /**
   * Calculate and create a commission record for order referrals
   */
  async calculateOrderReferralCommission(
    orderId: number,
    orderAmount: number,
    referralCode: string | null
  ): Promise<{
    success: boolean;
    commissionId?: string;
    amount?: number;
    message: string;
    error?: unknown;
  }> {
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
   * Calculate and create a commission record for distributor fulfillment
   */
  async calculateDistributorFulfillmentCommission(
    orderId: number,
    orderAmount: number,
    distributorId: string
  ): Promise<{
    success: boolean;
    commissionId?: string;
    amount?: number;
    message: string;
    error?: unknown;
  }> {
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
   * Get pending commissions for payout
   */
  async getPendingCommissions(): Promise<Commission[]> {
    try {
      const result = await sql`
        SELECT 
          c.id,
          c.user_id,
          c.amount,
          c.type,
          c.status,
          c.related_to,
          c.related_id,
          c.notes,
          c.created_at,
          c.updated_at,
          u.name as user_name,
          u.email as user_email
        FROM commissions c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = 'Approved'
        ORDER BY c.created_at ASC
      `;

      return getRows(result) as Commission[];
    } catch (error) {
      console.error('Failed to get pending commissions:', error);
      throw new Error('Failed to get pending commissions');
    }
  }

  /**
   * Process a batch payout for approved commissions
   */
  async processCommissionPayout(
    commissionIds: string[],
    payoutMethod: string,
    payoutReference: string
  ): Promise<{
    success: boolean;
    batchId: string;
    totalAmount: number;
    processedCount: number;
    message: string;
  }> {
    if (!commissionIds.length) {
      return {
        success: false,
        batchId: '',
        totalAmount: 0,
        processedCount: 0,
        message: 'No commission IDs provided',
      };
    }

    try {
      // Generate a unique batch ID
      const batchId = `payout-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Build a parameterized query for the array of IDs
      const commissionIdPlaceholders = commissionIds.map((_, i) => `$${i + 1}`).join(', ');
      const commissionsQuery = `
        SELECT id, user_id, amount, status
        FROM commissions
        WHERE id IN (${commissionIdPlaceholders})
          AND status = 'Approved'
      `;
      const commissionsResult = await sql.query(commissionsQuery, commissionIds);

      const commissions = getRows(commissionsResult);
      if (!commissions.length) {
        return {
          success: false,
          batchId: '',
          totalAmount: 0,
          processedCount: 0,
          message: 'No approved commissions found with the provided IDs',
        };
      }

      // Calculate total payout amount
      const totalAmount = commissions.reduce(
        (sum, commission) => sum + parseFloat(commission.amount),
        0
      );

      // Round to 2 decimal places
      const roundedTotal = Math.round(totalAmount * 100) / 100;

      // Use the same parameterization for the update query
      const updateQuery = `
        UPDATE commissions
        SET 
          status = 'Paid',
          payout_batch_id = $${commissionIds.length + 1},
          paid_at = NOW(),
          updated_at = NOW(),
          notes = CONCAT(notes, ' | Paid in batch: ', $${commissionIds.length + 1})
        WHERE id IN (${commissionIdPlaceholders})
          AND status = 'Approved'
        RETURNING id
      `;
      const updateResult = await sql.query(updateQuery, [...commissionIds, batchId]);
      const updatedCommissions = getRows(updateResult);

      // Create payout record
      await sql`
        INSERT INTO payouts (
          batch_id,
          amount,
          commission_count,
          method,
          reference,
          status,
          notes
        ) VALUES (
          ${batchId},
          ${roundedTotal},
          ${updatedCommissions.length},
          ${payoutMethod},
          ${payoutReference},
          'Completed',
          'Commission payout batch'
        )
      `;

      // Create notification for each user
      for (const commission of commissions) {
        await sql`
          INSERT INTO notifications (
            user_id,
            title,
            content,
            type,
            read
          ) VALUES (
            ${commission.user_id},
            'Commission Payment Processed',
            'Your commission payment of $${commission.amount} has been processed.',
            'Commission',
            false
          )
        `;
      }

      return {
        success: true,
        batchId,
        totalAmount: roundedTotal,
        processedCount: updatedCommissions.length,
        message: `Successfully processed ${updatedCommissions.length} commission payouts for a total of $${roundedTotal}`,
      };
    } catch (error) {
      console.error('Failed to process commission payout:', error);
      throw new Error('Failed to process commission payout');
    }
  }

  /**
   * Get commission statistics for a user
   */
  async getUserCommissionStats(userId: string): Promise<{
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
    totalLifetimeAmount: number;
    recentCommissions: Commission[];
  }> {
    try {
      // Get pending amount
      const pendingResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM commissions
        WHERE user_id = ${userId} AND status = 'Pending'
      `;
      const pendingAmount = parseFloat(getRows(pendingResult)[0].total) || 0;

      // Get approved amount
      const approvedResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM commissions
        WHERE user_id = ${userId} AND status = 'Approved'
      `;
      const approvedAmount = parseFloat(getRows(approvedResult)[0].total) || 0;

      // Get paid amount
      const paidResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM commissions
        WHERE user_id = ${userId} AND status = 'Paid'
      `;
      const paidAmount = parseFloat(getRows(paidResult)[0].total) || 0;

      // Get total lifetime amount (regardless of status)
      const totalResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM commissions
        WHERE user_id = ${userId} AND status != 'Cancelled'
      `;
      const totalLifetimeAmount = parseFloat(getRows(totalResult)[0].total) || 0;

      // Get recent commissions
      const recentResult = await sql`
        SELECT 
          id, user_id, amount, type, status, related_to, related_id, 
          notes, created_at, updated_at, paid_at, payout_batch_id
        FROM commissions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const recentCommissions = getRows(recentResult) as Commission[];

      return {
        pendingAmount,
        approvedAmount,
        paidAmount,
        totalLifetimeAmount,
        recentCommissions,
      };
    } catch (error) {
      console.error(`Failed to get commission stats for user ${userId}:`, error);
      throw new Error('Failed to get commission statistics');
    }
  }
}
