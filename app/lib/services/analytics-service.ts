import { db, sql } from '@/lib/db';
import { getRows, castDbRows, DbQueryResult } from '@/lib/db-types';

export interface SalesData {
  period: string;
  total_sales: number;
  order_count: number;
  average_order_value: number;
}

export interface ProductPerformance {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  variant_id?: number;
  variant_name?: string;
}

export interface CategoryPerformance {
  category: string;
  quantity_sold: number;
  revenue: number;
  product_count: number;
}

export interface DistributorPerformance {
  distributor_id: string;
  distributor_name: string;
  orders_fulfilled: number;
  total_earnings: number;
  average_fulfillment_time: number;
}

export interface ReferralPerformance {
  user_id: string;
  user_name: string;
  referrals_count: number;
  orders_generated: number;
  revenue_generated: number;
  total_earnings: number;
}

export interface GeographicDistribution {
  region: string;
  order_count: number;
  revenue: number;
  customer_count: number;
}

export interface BusinessOverview {
  total_sales: number;
  sales_growth: number;
  average_order_value: number;
  active_customers: number;
  total_orders: number;
  inventory_value: number;
  top_products: ProductPerformance[];
  sales_by_category: CategoryPerformance[];
}

/**
 * Service for analytics and business intelligence
 */
export class AnalyticsService {
  /**
   * Get sales data by period (day, week, month, year)
   */
  async getSalesByPeriod(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date
  ): Promise<SalesData[]> {
    try {
      let dateFormat: string;

      switch (period) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'IYYY-IW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'year':
          dateFormat = 'YYYY';
          break;
        // Add default case or handle unexpected periods if necessary
        default:
          throw new Error(`Invalid period specified: ${period}`);
      }

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
        SELECT
          TO_CHAR(created_at, ${dateFormat}) as period,
          SUM(CAST(total_amount AS FLOAT)) as total_sales,
          COUNT(*) as order_count,
          ROUND(SUM(CAST(total_amount AS FLOAT)) / COUNT(*), 2) as average_order_value
        FROM orders
        WHERE
          status NOT IN ('Draft', 'Cancelled')
          AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        GROUP BY period
        ORDER BY period
      `);

      return castDbRows<SalesData[]>(getRows(result));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching sales data by period:', error);
      throw new Error(`Failed to fetch sales data: ${errorMessage}`);
    }
  }

  /**
   * Get top performing products by sales volume or revenue
   */
  async getTopProducts(
    sortBy: 'quantity' | 'revenue',
    limit: number,
    startDate?: Date,
    endDate?: Date,
    categoryFilter?: string
  ): Promise<ProductPerformance[]> {
    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      // Build category filter
      let categoryClause = sql``;
      if (categoryFilter) {
        categoryClause = sql`AND p.category = ${categoryFilter}`;
      }

      // Sort by the requested metric
      const sortClause =
        sortBy === 'quantity'
          ? sql`SUM(oi.quantity) DESC`
          : sql`SUM(CAST(oi.price_at_purchase * oi.quantity AS FLOAT)) DESC`;

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
        SELECT
          p.id as product_id,
          p.name as product_name,
          pv.id as variant_id,
          pv.name as variant_name,
          SUM(oi.quantity) as quantity_sold,
          SUM(CAST(oi.price_at_purchase * oi.quantity AS FLOAT)) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN product_variations pv ON oi.product_variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE
          o.status NOT IN ('Draft', 'Cancelled')
          ${dateFilter}
          ${categoryClause}
        GROUP BY p.id, p.name, pv.id, pv.name
        ORDER BY ${sortClause}
        LIMIT ${limit}
      `);

      return castDbRows<ProductPerformance[]>(getRows(result));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching top products:', error);
      throw new Error(`Failed to fetch top products: ${errorMessage}`);
    }
  }

  /**
   * Get sales performance by product category
   */
  async getSalesByCategory(startDate?: Date, endDate?: Date): Promise<CategoryPerformance[]> {
    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
        SELECT
          COALESCE(p.category, 'Uncategorized') as category,
          SUM(oi.quantity) as quantity_sold,
          SUM(CAST(oi.price_at_purchase * oi.quantity AS FLOAT)) as revenue,
          COUNT(DISTINCT p.id) as product_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN product_variations pv ON oi.product_variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE
          o.status NOT IN ('Draft', 'Cancelled')
          ${dateFilter}
        GROUP BY COALESCE(p.category, 'Uncategorized')
        ORDER BY revenue DESC
      `);

      return castDbRows<CategoryPerformance[]>(getRows(result));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching sales by category:', error);
      throw new Error(`Failed to fetch category sales: ${errorMessage}`);
    }
  }

  /**
   * Get distributor performance metrics
   */
  async getDistributorPerformance(
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<DistributorPerformance[]> {
    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
        SELECT
          d.user_id as distributor_id,
          u.name as distributor_name,
          COUNT(DISTINCT o.id) as orders_fulfilled,
          COALESCE(SUM(CAST(c.amount AS FLOAT)), 0) as total_earnings
        FROM distributors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN orders o ON o.distributor_id = d.user_id AND o.status = 'Shipped' ${dateFilter}
        LEFT JOIN commissions c ON c.user_id = d.user_id AND c.type = 'Fulfillment' AND c.order_id = o.id
        GROUP BY d.user_id, u.name
        ORDER BY total_earnings DESC
        LIMIT ${limit}
      `);

      // Manually add average_fulfillment_time if calculated separately or default to 0
      const performanceData = getRows(result).map(row => ({
        ...row,
        distributor_id: String(row.distributor_id),
        distributor_name: String(row.distributor_name),
        orders_fulfilled: Number(row.orders_fulfilled),
        total_earnings: Number(row.total_earnings),
        average_fulfillment_time: 0, // Placeholder - replace with actual calculation if possible
      }));

      return castDbRows<DistributorPerformance[]>(performanceData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching distributor performance:', error);
      throw new Error(`Failed to fetch distributor performance: ${errorMessage}`);
    }
  }

  /**
   * Get referral performance metrics
   */
  async getReferralPerformance(
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<ReferralPerformance[]> {
    try {
      // Build date filter for orders
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
        SELECT
          u.id as user_id,
          u.name as user_name,
          COUNT(DISTINCT r.referred_user_id) as referrals_count,
          COUNT(DISTINCT o.id) as orders_generated,
          COALESCE(SUM(CAST(o.total_amount AS FLOAT)), 0) as revenue_generated,
          COALESCE(SUM(CAST(c.amount AS FLOAT)), 0) as total_earnings
        FROM users u
        LEFT JOIN referrals r ON r.referrer_user_id = u.id
        LEFT JOIN orders o ON o.applied_referral_code = u.referral_code ${dateFilter} AND o.status NOT IN ('Draft', 'Cancelled')
        LEFT JOIN commissions c ON c.user_id = u.id AND c.type = 'Referral Sale' AND c.order_id = o.id
        GROUP BY u.id, u.name
        ORDER BY total_earnings DESC
        LIMIT ${limit}
      `);

      return castDbRows<ReferralPerformance[]>(getRows(result));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching referral performance:', error);
      throw new Error(`Failed to fetch referral performance: ${errorMessage}`);
    }
  }

  /**
   * Get geographic distribution of orders or customers
   */
  async getGeographicDistribution(
    metric: 'orders' | 'customers' | 'revenue',
    regionLevel: 'country' | 'province',
    startDate?: Date,
    endDate?: Date
  ): Promise<GeographicDistribution[]> {
    try {
      // Determine the grouping column based on regionLevel
      const regionColumn =
        regionLevel === 'province'
          ? sql`shipping_address->>'province'`
          : sql`shipping_address->>'country'`;
      const regionAlias = sql.raw('region');

      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      // Select metrics based on the requested metric
      let selectClause = sql``;
      let groupByClause = sql`GROUP BY ${regionAlias}`;
      let orderByClause = sql``;

      switch (metric) {
        case 'orders':
          selectClause = sql`COUNT(*) as order_count`;
          orderByClause = sql`ORDER BY order_count DESC`;
          break;
        case 'customers':
          selectClause = sql`COUNT(DISTINCT user_id) as customer_count`;
          orderByClause = sql`ORDER BY customer_count DESC`;
          break;
        case 'revenue':
          selectClause = sql`SUM(CAST(total_amount AS FLOAT)) as revenue`;
          orderByClause = sql`ORDER BY revenue DESC`;
          break;
        default:
          throw new Error(`Invalid metric specified: ${metric}`);
      }

      // Combine clauses for the final query
      const result = await db.execute(sql`
        SELECT
          ${regionColumn} as ${regionAlias},
          ${selectClause}
          ${metric !== 'orders' ? sql`, COUNT(*) as order_count` : sql``}
          ${metric !== 'customers' ? sql`, COUNT(DISTINCT user_id) as customer_count` : sql``}
          ${metric !== 'revenue' ? sql`, COALESCE(SUM(CAST(total_amount AS FLOAT)), 0) as revenue` : sql``}
        FROM orders
        ${dateFilter}
        ${dateFilter ? sql`AND` : sql`WHERE`} status NOT IN ('Draft', 'Cancelled')
          AND shipping_address IS NOT NULL
          AND jsonb_typeof(shipping_address) = 'object'
          AND shipping_address ? (${regionLevel === 'province' ? 'province' : 'country'})
          AND ${regionColumn} IS NOT NULL AND TRIM(${regionColumn}) <> ''
        ${groupByClause}
        ${orderByClause}
      `);

      return castDbRows<GeographicDistribution[]>(getRows(result));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching geographic distribution:', error);
      throw new Error(`Failed to fetch geographic distribution: ${errorMessage}`);
    }
  }

  /**
   * Get overall business overview statistics
   */
  async getBusinessOverview(
    periodStartDate: Date,
    periodEndDate: Date,
    comparisonStartDate: Date,
    comparisonEndDate: Date
  ): Promise<BusinessOverview> {
    // Ensure db is not null
    if (!db) throw new Error('Database connection not available.');

    try {
      // Fetch data for the current period
      const currentPeriodSalesResult = await db.execute(sql`
        SELECT
          SUM(CAST(total_amount AS FLOAT)) as total_sales,
          COUNT(*) as total_orders,
          COUNT(DISTINCT user_id) as active_customers
        FROM orders
        WHERE status NOT IN ('Draft', 'Cancelled')
          AND created_at BETWEEN ${periodStartDate.toISOString()} AND ${periodEndDate.toISOString()}
      `);

      // Fetch data for the comparison period
      const comparisonPeriodSalesResult = await db.execute(sql`
        SELECT SUM(CAST(total_amount AS FLOAT)) as total_sales
        FROM orders
        WHERE status NOT IN ('Draft', 'Cancelled')
          AND created_at BETWEEN ${comparisonStartDate.toISOString()} AND ${comparisonEndDate.toISOString()}
      `);

      // Fetch top products for the current period
      const topProducts = await this.getTopProducts('revenue', 5, periodStartDate, periodEndDate);

      // Fetch sales by category for the current period
      const salesByCategory = await this.getSalesByCategory(periodStartDate, periodEndDate);

      // Calculate inventory value (requires joining products/variations/stock_levels)
      const inventoryValueResult = await db.execute(sql`
        SELECT SUM(CAST(p.cost_price AS FLOAT) * sl.quantity) as total_value
        FROM stock_levels sl
        JOIN product_variations pv ON sl.product_variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE sl.quantity > 0
      `);

      // Process results safely
      const currentSalesRow = getRows(currentPeriodSalesResult)[0] || {};
      const comparisonSalesRow = getRows(comparisonPeriodSalesResult)[0] || {};
      const inventoryValueRow = getRows(inventoryValueResult)[0] || {};

      const currentTotalSales = Number(currentSalesRow.total_sales || 0);
      const comparisonTotalSales = Number(comparisonSalesRow.total_sales || 0);
      const totalOrders = Number(currentSalesRow.total_orders || 0);

      // Calculate sales growth
      let salesGrowth = 0;
      if (comparisonTotalSales > 0) {
        salesGrowth = ((currentTotalSales - comparisonTotalSales) / comparisonTotalSales) * 100;
      } else if (currentTotalSales > 0) {
        salesGrowth = 100;
      }

      const overview: BusinessOverview = {
        total_sales: currentTotalSales,
        sales_growth: parseFloat(salesGrowth.toFixed(2)),
        average_order_value:
          totalOrders > 0 ? parseFloat((currentTotalSales / totalOrders).toFixed(2)) : 0,
        active_customers: Number(currentSalesRow.active_customers || 0),
        total_orders: totalOrders,
        inventory_value: Number(inventoryValueRow.total_value || 0),
        top_products: topProducts,
        sales_by_category: salesByCategory,
      };

      return overview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching business overview:', error);
      throw new Error(`Failed to fetch business overview: ${errorMessage}`);
    }
  }

  // Add other analytics methods as needed...
}

// Export an instance for easy use
export const analyticsService = new AnalyticsService();
