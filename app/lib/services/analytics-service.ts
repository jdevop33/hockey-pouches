import { sql } from '@/lib/db';
import { getRows } from '@/lib/db-types';

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
  async $1(...$2: any[]): Promise<SalesData[]> {
    // TODO: Implement getSalesByPeriod
    return {
      // Default empty object for SalesData[]
    };

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
      }

      const result = await sql`
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
      `;

      return getRows(result as unknown as DbQueryResult) as SalesData[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching sales data by period:', error);
      throw new Error(
        `Failed to fetch sales data: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get top performing products by sales volume or revenue
   */
  async $1(...$2: any[]): Promise<ProductPerformance[]> {
    // TODO: Implement getTopProducts
    return {
      // Default empty object for ProductPerformance[]
    };

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
        sortBy === 'quantity' ? sql`SUM(oi.quantity) DESC` : sql`SUM(oi.total_price) DESC`;

      const result = await sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          COALESCE(pv.id, 0) as variant_id,
          COALESCE(pv.name, '') as variant_name,
          SUM(oi.quantity) as quantity_sold,
          SUM(CAST(oi.total_price AS FLOAT)) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variations pv ON oi.variant_id = pv.id
        WHERE 
          o.status NOT IN ('Draft', 'Cancelled')
          ${dateFilter}
          ${categoryClause}
        GROUP BY p.id, p.name, pv.id, pv.name
        ORDER BY ${sortClause}
        LIMIT ${limit}
      `;

      return getRows(result as unknown as DbQueryResult) as ProductPerformance[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching top products:', error);
      throw new Error(
        `Failed to fetch top products: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get sales performance by product category
   */
  async $1(...$2: any[]): Promise<CategoryPerformance[]> {
    // TODO: Implement getSalesByCategory
    return {
      // Default empty object for CategoryPerformance[]
    };

    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      const result = await sql`
        SELECT 
          COALESCE(p.category, 'Uncategorized') as category,
          SUM(oi.quantity) as quantity_sold,
          SUM(CAST(oi.total_price AS FLOAT)) as revenue,
          COUNT(DISTINCT p.id) as product_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE 
          o.status NOT IN ('Draft', 'Cancelled')
          ${dateFilter}
        GROUP BY COALESCE(p.category, 'Uncategorized')
        ORDER BY revenue DESC
      `;

      return getRows(result as unknown as DbQueryResult) as CategoryPerformance[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching sales by category:', error);
      throw new Error(
        `Failed to fetch category sales: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get distributor performance metrics
   */
  async $1(...$2: any[]): Promise<DistributorPerformance[]> {
    // TODO: Implement getDistributorPerformance
    return {
      // Default empty object for DistributorPerformance[]
    };

    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      const result = await sql`
        SELECT 
          u.id as distributor_id,
          u.name as distributor_name,
          COUNT(o.id) as orders_fulfilled,
          SUM(c.amount) as total_earnings,
          AVG(EXTRACT(EPOCH FROM (f.completed_at - f.created_at))/3600) as average_fulfillment_time
        FROM orders o
        JOIN fulfillments f ON o.id = f.order_id
        JOIN users u ON f.distributor_id = u.id
        LEFT JOIN commissions c ON (c.related_to = 'Order' AND c.related_id = o.id::text AND c.user_id = u.id)
        WHERE 
          o.status IN ('Fulfilled', 'Delivered')
          AND u.role = 'Distributor'
          ${dateFilter}
        GROUP BY u.id, u.name
        ORDER BY orders_fulfilled DESC
        LIMIT ${limit}
      `;

      return getRows(result as unknown as DbQueryResult) as DistributorPerformance[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching distributor performance:', error);
      throw new Error(
        `Failed to fetch distributor metrics: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get referral program performance
   */
  async $1(...$2: any[]): Promise<ReferralPerformance[]> {
    // TODO: Implement getReferralPerformance
    return {
      // Default empty object for ReferralPerformance[]
    };

    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      const result = await sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COUNT(DISTINCT referred.id) as referrals_count,
          COUNT(DISTINCT o.id) as orders_generated,
          SUM(CAST(o.total_amount AS FLOAT)) as revenue_generated,
          SUM(c.amount) as total_earnings
        FROM users u
        JOIN users referred ON referred.referred_by_user_id = u.id
        LEFT JOIN orders o ON o.customer_id = referred.id ${dateFilter}
        LEFT JOIN commissions c ON c.user_id = u.id AND c.type = 'Order Referral' AND c.related_id = o.id::text
        GROUP BY u.id, u.name
        ORDER BY revenue_generated DESC
        LIMIT ${limit}
      `;

      return getRows(result as unknown as DbQueryResult) as ReferralPerformance[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching referral performance:', error);
      throw new Error(
        `Failed to fetch referral metrics: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get geographic distribution of sales
   */
  async $1(...$2: any[]): Promise<GeographicDistribution[]> {
    // TODO: Implement getGeographicDistribution
    return {
      // Default empty object for GeographicDistribution[]
    };

    try {
      // Build date filter
      let dateFilter = sql``;
      if (startDate && endDate) {
        dateFilter = sql`AND o.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
      }

      const result = await sql`
        SELECT 
          COALESCE(o.shipping_address->>'state', 'Unknown') as region,
          COUNT(o.id) as order_count,
          SUM(CAST(o.total_amount AS FLOAT)) as revenue,
          COUNT(DISTINCT o.customer_id) as customer_count
        FROM orders o
        WHERE 
          o.status NOT IN ('Draft', 'Cancelled')
          ${dateFilter}
        GROUP BY region
        ORDER BY revenue DESC
      `;

      return getRows(result as unknown as DbQueryResult) as GeographicDistribution[];
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching geographic distribution:', error);
      throw new Error(
        `Failed to fetch geographic data: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get business overview with key metrics
   */
  async $1(...$2: any[]): Promise<BusinessOverview> {
    // TODO: Implement getBusinessOverview
    return {
      // Default empty object for BusinessOverview
    };

    try {
      // Get sales data for the current period
      const salesResult = await sql`
        SELECT 
          SUM(CAST(total_amount AS FLOAT)) as total_sales,
          COUNT(*) as total_orders,
          ROUND(SUM(CAST(total_amount AS FLOAT)) / COUNT(*), 2) as average_order_value
        FROM orders
        WHERE 
          status NOT IN ('Draft', 'Cancelled')
          AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      `;

      const salesData = getRows(salesResult as unknown as DbQueryResult)[0];

      // Get comparison period sales for growth calculation
      let salesGrowth = 0;
      if (comparisonStartDate && comparisonEndDate) {
        const comparisonResult = await sql`
          SELECT SUM(CAST(total_amount AS FLOAT)) as comparison_sales
          FROM orders
          WHERE 
            status NOT IN ('Draft', 'Cancelled')
            AND created_at BETWEEN ${comparisonStartDate.toISOString()} AND ${comparisonEndDate.toISOString()}
        `;

        const comparisonData = getRows(comparisonResult as unknown as DbQueryResult)[0];

        if (comparisonData.comparison_sales > 0) {
          salesGrowth =
            ((salesData.total_sales - comparisonData.comparison_sales) /
              comparisonData.comparison_sales) *
            100;
        }
      }

      // Get active customers count
      const customersResult = await sql`
        SELECT COUNT(DISTINCT customer_id) as active_customers
        FROM orders
        WHERE 
          status NOT IN ('Draft', 'Cancelled')
          AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      `;

      const customersData = getRows(customersResult as unknown as DbQueryResult)[0];

      // Get inventory value
      const inventoryResult = await sql`
        SELECT 
          SUM(
            CASE 
              WHEN sl.product_variation_id IS NULL THEN sl.quantity * p.price
              ELSE sl.quantity * pv.price
            END
          ) as inventory_value
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variations pv ON sl.product_variation_id = pv.id
      `;

      const inventoryData = getRows(inventoryResult as unknown as DbQueryResult)[0];

      // Get top products
      const topProducts = await this.getTopProducts(5, 'revenue', startDate, endDate);

      // Get sales by category
      const salesByCategory = await this.getSalesByCategory(startDate, endDate);

      return {
        total_sales: salesData.total_sales || 0,
        sales_growth: Math.round(salesGrowth * 100) / 100,
        average_order_value: salesData.average_order_value || 0,
        active_customers: customersData.active_customers || 0,
        total_orders: salesData.total_orders || 0,
        inventory_value: inventoryData.inventory_value || 0,
        top_products: topProducts,
        sales_by_category: salesByCategory,
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching business overview:', error);
      throw new Error(
        `Failed to fetch business overview: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get comprehensive inventory analytics
   */
  async getInventoryAnalytics(): Promise<{
    total_inventory_value: number;
    slow_moving_products: ProductPerformance[];
    out_of_stock_products: Array<{
      product_id: number;
      product_name: string;
      days_out_of_stock: number;
    }>;
    inventory_turnover: Array<{ product_id: number; product_name: string; turnover_rate: number }>;
  }> {
    try {
      // Get total inventory value
      const inventoryValueResult = await sql`
        SELECT 
          SUM(
            CASE 
              WHEN sl.product_variation_id IS NULL THEN sl.quantity * p.price
              ELSE sl.quantity * pv.price
            END
          ) as total_value
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variations pv ON sl.product_variation_id = pv.id
      `;

      const inventoryValue = getRows(inventoryValueResult as unknown as DbQueryResult)[0].total_value || 0;

      // Get slow moving products (products with inventory but low sales in last 90 days)
      const slowMovingResult = await sql`
        WITH product_sales AS (
          SELECT 
            oi.product_id,
            COALESCE(oi.variant_id, 0) as variant_id,
            SUM(oi.quantity) as quantity_sold
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE 
            o.status NOT IN ('Draft', 'Cancelled')
            AND o.created_at > NOW() - INTERVAL '90 days'
          GROUP BY oi.product_id, COALESCE(oi.variant_id, 0)
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          COALESCE(pv.id, 0) as variant_id,
          COALESCE(pv.name, '') as variant_name,
          COALESCE(ps.quantity_sold, 0) as quantity_sold,
          sl.quantity as current_stock,
          CASE 
            WHEN sl.product_variation_id IS NULL THEN p.price * sl.quantity
            ELSE pv.price * sl.quantity
          END as revenue
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variations pv ON sl.product_variation_id = pv.id
        LEFT JOIN product_sales ps ON 
          ps.product_id = p.id AND 
          (
            (sl.product_variation_id IS NULL AND ps.variant_id = 0) OR
            (sl.product_variation_id = ps.variant_id)
          )
        WHERE 
          sl.quantity > 0
          AND COALESCE(ps.quantity_sold, 0) < 5
        ORDER BY current_stock DESC
        LIMIT 10
      `;

      const slowMovingProducts = getRows(slowMovingResult as unknown as DbQueryResult) as ProductPerformance[];

      // Get out of stock products and days out of stock
      const outOfStockResult = await sql`
        WITH last_in_stock AS (
          SELECT 
            sm.product_id,
            sm.product_variation_id,
            MAX(sm.created_at) as last_date
          FROM stock_movements sm
          JOIN stock_levels sl ON 
            sm.product_id = sl.product_id AND
            COALESCE(sm.product_variation_id, 0) = COALESCE(sl.product_variation_id, 0)
          WHERE 
            sl.quantity = 0 AND
            sm.quantity < 0 AND
            sm.type IN ('Fulfilled', 'Adjusted')
          GROUP BY sm.product_id, sm.product_variation_id
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          EXTRACT(DAY FROM NOW() - lis.last_date) as days_out_of_stock
        FROM last_in_stock lis
        JOIN products p ON lis.product_id = p.id
        ORDER BY days_out_of_stock DESC
        LIMIT 10
      `;

      const outOfStockProducts = getRows(outOfStockResult as unknown as DbQueryResult) as Array<{
        product_id: number;
        product_name: string;
        days_out_of_stock: number;
      }>;

      // Calculate inventory turnover rate
      const turnoverResult = await sql`
        WITH product_sales AS (
          SELECT 
            oi.product_id,
            COALESCE(oi.variant_id, 0) as variant_id,
            SUM(oi.quantity) as quantity_sold
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE 
            o.status NOT IN ('Draft', 'Cancelled')
            AND o.created_at > NOW() - INTERVAL '365 days'
          GROUP BY oi.product_id, COALESCE(oi.variant_id, 0)
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          COALESCE(ps.quantity_sold, 0) as annual_sales,
          sl.quantity as current_stock,
          CASE 
            WHEN sl.quantity = 0 THEN 0
            ELSE COALESCE(ps.quantity_sold, 0) / sl.quantity
          END as turnover_rate
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_sales ps ON 
          ps.product_id = p.id AND 
          (
            (sl.product_variation_id IS NULL AND ps.variant_id = 0) OR
            (sl.product_variation_id = ps.variant_id)
          )
        WHERE sl.quantity > 0
        ORDER BY turnover_rate DESC
        LIMIT 10
      `;

      const inventoryTurnover = getRows(turnoverResult as unknown as DbQueryResult) as Array<{
        product_id: number;
        product_name: string;
        turnover_rate: number;
      }>;

      return {
        total_inventory_value: inventoryValue,
        slow_moving_products: slowMovingProducts,
        out_of_stock_products: outOfStockProducts,
        inventory_turnover: inventoryTurnover,
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching inventory analytics:', error);
      throw new Error(
        `Failed to fetch inventory analytics: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }

  /**
   * Get sales forecasts based on historical data
   */
  async getSalesForecast(
    forecastPeriods: number = 3,
    periodType: 'day' | 'week' | 'month' = 'month'
  ): Promise<Array<{ period: string; forecasted_sales: number; confidence: number }>> {
    try {
      // Get historical sales data
      const historicalPeriods = forecastPeriods * 4; // Use 4x historical data for forecasting

      let dateFormat: string;

      switch (periodType) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'IYYY-IW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
      }

      const historicalResult = await sql`
        SELECT 
          TO_CHAR(created_at, ${dateFormat}) as period,
          SUM(CAST(total_amount AS FLOAT)) as total_sales
        FROM orders
        WHERE 
          status NOT IN ('Draft', 'Cancelled')
          AND created_at > NOW() - (${historicalPeriods + 1}::text || ' ' || ${periodType})::interval
        GROUP BY period
        ORDER BY period
      `;

      const historicalData = getRows(historicalResult as unknown as DbQueryResult) as Array<{
        period: string;
        total_sales: number;
      }>;

      // This is a very simple forecasting model
      // In a real implementation, you would use a more sophisticated algorithm

      // Calculate average and standard deviation
      let sum = 0;
      let sumSquaredDiff = 0;

      historicalData.forEach(data => {
        sum += data.total_sales;
      });

      const average = sum / Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? historicalData.length : 0 : 0 : 0 : 0;

      historicalData.forEach(data => {
        sumSquaredDiff += Math.pow(data.total_sales - average, 2);
      });

      const stdDev = Math.sqrt(sumSquaredDiff / Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? historicalData.length : 0 : 0 : 0 : 0);

      // Calculate forecast with linear trend
      const forecast: Array<{ period: string; forecasted_sales: number; confidence: number }> = [];

      // Find trend (simple linear regression)
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      historicalData.forEach((data, index) => {
        sumX += index;
        sumY += data.total_sales;
        sumXY += index * data.total_sales;
        sumXX += index * index;
      });

      const n = Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? historicalData.length : 0 : 0 : 0 : 0;
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Generate forecast periods
      const lastPeriod = historicalData[Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? Array.isArray(historicalData) ? historicalData.length : 0 : 0 : 0 : 0 - 1].period;

      for (let i = 1; i <= forecastPeriods; i++) {
        // Calculate next period (simplified)
        let nextPeriod: string;

        switch (periodType) {
          case 'day': {
            const [lastYear, lastMonth, lastDay] = lastPeriod.split('-').map(Number);
            const nextDate = new Date(lastYear, lastMonth - 1, lastDay + i);
            nextPeriod = nextDate.toISOString().substring(0, 10);
            break;
          }
          case 'week': {
            const [lastWeekYear, lastWeek] = lastPeriod.split('-').map(Number);
            // This is a simplification - in reality, week calculation is more complex
            nextPeriod = `${lastWeekYear}-${String(lastWeek + i).padStart(2, '0')}`;
            break;
          }
          case 'month': {
            const [lastMonthYear, lastMonth2] = lastPeriod.split('-').map(Number);
            const nextMonth = lastMonth2 + i;
            const yearOffset = Math.floor((nextMonth - 1) / 12);
            const adjustedMonth = ((nextMonth - 1) % 12) + 1;
            nextPeriod = `${lastMonthYear + yearOffset}-${String(adjustedMonth).padStart(2, '0')}`;
            break;
          }
        }

        // Forecast value using linear trend
        const forecastedSales = intercept + slope * (n + i - 1);

        // Calculate confidence based on standard deviation
        // Higher standard deviation = lower confidence
        const confidence = Math.max(0, Math.min(100, 100 - (stdDev / average) * 100));

        forecast.push({
          period: nextPeriod,
          forecasted_sales: Math.max(0, forecastedSales), // Ensure non-negative
          confidence,
        });
      }

      return forecast;
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error generating sales forecast:', error);
      throw new Error(
        `Failed to generate sales forecast: ${error instanceof Error ? errorMessage : 'Unknown error'}`
      );
    }
  }
}
