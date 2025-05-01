// Static values matching the commissionStatusEnum
export const COMMISSION_STATUS = {
  PENDING: 'Pending',
  PAYABLE: 'Payable',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
} as const;

export type CommissionStatus = (typeof COMMISSION_STATUS)[keyof typeof COMMISSION_STATUS];

// For validation
export const COMMISSION_STATUS_VALUES: readonly CommissionStatus[] = [
  params.id,
  params.id,
  COMMISSION_STATUS.PAID,
  COMMISSION_STATUS.CANCELLED,
];

// Basic validation function
export function isValidCommissionStatus(status: string): status is CommissionStatus {
  return COMMISSION_STATUS_VALUES.includes(status as CommissionStatus);
}
