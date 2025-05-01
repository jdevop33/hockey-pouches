// app/lib/schema/index.ts
// This file exports all schemas, relations, and enums from the schema directory

// Import tables and relations
export * from './users';
export * from './products';
export * from './inventory'; // Exports stockLocations, stockLevels, stockMovements, stockLocationTypeEnum, stockMovementTypeEnum
export * from './pricing';

// Import from orders.ts but exclude the paymentMethodEnum and paymentStatusEnum to avoid conflicts
import {
  orders,
  orderItems,
  orderStatusHistory,
  orderFulfillments,
  ordersRelations,
  orderItemsRelations,
  orderStatusHistoryRelations,
  orderFulfillmentsRelations,
  orderStatusEnum,
  orderTypeEnum,
  fulfillmentStatusEnum,
} from './orders';

// Re-export everything from orders except the conflicting enums
export {
  orders,
  orderItems,
  orderStatusHistory,
  orderFulfillments,
  ordersRelations,
  orderItemsRelations,
  orderStatusHistoryRelations,
  orderFulfillmentsRelations,
  orderStatusEnum,
  orderTypeEnum,
  fulfillmentStatusEnum,
};

export * from './cart';
export * from './commissions'; // Exports commissions and related enums (commissionStatusEnum, commissionTypeEnum, commissionRelatedEntityEnum)

// Import all from payments.ts
export * from './payments';

export * from './referrals'; // Exports referrals table and relations
export * from './discounts'; // Exports discountCodes and related enums (discountTypeEnum)
export * from './wholesale';
export * from './notifications';
export * from './tasks'; // Exports tasks and related enums (taskStatusEnum, taskPriorityEnum, taskCategoryEnum, taskRelatedEntityEnum)
export * from './auth'; // Exports tokenBlacklist table

// Note: Ensure that each schema file correctly defines and exports its tables, relations, and associated enums.
