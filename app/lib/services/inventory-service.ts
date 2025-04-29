import { sql } from '@/lib/db'; // Corrected import
import { getRows } from '@/lib/db-types';

// Types for inventory management
export type StockLocationType = 'Warehouse' | 'Store' | 'Distribution Center';
export type StockMovementType = 'Received' | 'Fulfilled' | 'Returned' | 'Adjusted' | 'Transferred';

export interface StockLocation {
  id: string;
  name: string;
  address?: string;
  type: StockLocationType;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockLevel {
  id: string;
  product_id: number;
  product_variation_id?: number;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_point?: number;
  reorder_quantity?: number;
  last_recount_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: string;
  product_id: number;
  product_variation_id?: number;
  location_id: string;
  quantity: number;
  type: StockMovementType;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by: string;
  created_at?: string;
}

/**
 * Service for inventory-related operations
 */
export class InventoryService {
  /**
   * Get inventory levels for a product across all locations
   */
  async getProductInventory(productId: number): Promise<StockLevel[]> {
    try {
      const result = await sql`
        SELECT 
          sl.id,
          sl.product_id,
          sl.product_variation_id,
          sl.location_id,
          sl.quantity,
          sl.reserved_quantity,
          sl.reorder_point,
          sl.reorder_quantity,
          sl.last_recount_date,
          sl.created_at,
          sl.updated_at
        FROM stock_levels sl
        WHERE sl.product_id = ${productId}
        ORDER BY sl.location_id
      `;

      return getRows(result) as StockLevel[];
    } catch (error) {
      console.error(`Error fetching inventory for product ${productId}:`, error);
      throw new Error(
        `Failed to fetch inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get inventory levels for a product variation across all locations
   */
  async getVariationInventory(variationId: number): Promise<StockLevel[]> {
    try {
      const result = await sql`
        SELECT 
          sl.id,
          sl.product_id,
          sl.product_variation_id,
          sl.location_id,
          sl.quantity,
          sl.reserved_quantity,
          sl.reorder_point,
          sl.reorder_quantity,
          sl.last_recount_date,
          sl.created_at,
          sl.updated_at
        FROM stock_levels sl
        WHERE sl.product_variation_id = ${variationId}
        ORDER BY sl.location_id
      `;

      return getRows(result) as StockLevel[];
    } catch (error) {
      console.error(`Error fetching inventory for variation ${variationId}:`, error);
      throw new Error(
        `Failed to fetch inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get inventory levels for a specific location
   */
  async getLocationInventory(locationId: string): Promise<StockLevel[]> {
    try {
      const result = await sql`
        SELECT 
          sl.id,
          sl.product_id,
          sl.product_variation_id,
          sl.location_id,
          sl.quantity,
          sl.reserved_quantity,
          sl.reorder_point,
          sl.reorder_quantity,
          sl.last_recount_date,
          sl.created_at,
          sl.updated_at
        FROM stock_levels sl
        WHERE sl.location_id = ${locationId}
        ORDER BY sl.product_id, sl.product_variation_id
      `;

      return getRows(result) as StockLevel[];
    } catch (error) {
      console.error(`Error fetching inventory for location ${locationId}:`, error);
      throw new Error(
        `Failed to fetch inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Adjust inventory levels for a product/variation at a location
   */
  async adjustInventory(
    productId: number,
    locationId: string,
    quantity: number,
    userId: string,
    notes?: string,
    variationId?: number,
    referenceId?: string,
    referenceType?: string
  ): Promise<StockLevel> {
    try {
      // Start a transaction
      await sql`BEGIN`;

      try {
        // Check if stock level record exists
        const existingResult = await sql`
          SELECT id, quantity, reserved_quantity
          FROM stock_levels
          WHERE 
            product_id = ${productId}
            AND location_id = ${locationId}
            ${variationId ? sql`AND product_variation_id = ${variationId}` : sql`AND product_variation_id IS NULL`}
        `;

        const existingRows = getRows(existingResult);
        let stockLevel: StockLevel;

        if (existingRows.length === 0) {
          // Create new stock level record
          const createResult = await sql`
            INSERT INTO stock_levels (
              product_id,
              product_variation_id,
              location_id,
              quantity,
              reserved_quantity,
              created_at,
              updated_at
            ) VALUES (
              ${productId},
              ${variationId || null},
              ${locationId},
              ${quantity > 0 ? quantity : 0},
              0,
              NOW(),
              NOW()
            )
            RETURNING 
              id, product_id, product_variation_id, location_id, quantity,
              reserved_quantity, reorder_point, reorder_quantity, last_recount_date,
              created_at, updated_at
          `;

          stockLevel = getRows(createResult)[0] as StockLevel;
        } else {
          // Update existing stock level record
          const existing = existingRows[0];
          const newQuantity = existing.quantity + quantity;

          const updateResult = await sql`
            UPDATE stock_levels
            SET 
              quantity = ${newQuantity > 0 ? newQuantity : 0},
              updated_at = NOW()
            WHERE id = ${existing.id}
            RETURNING 
              id, product_id, product_variation_id, location_id, quantity,
              reserved_quantity, reorder_point, reorder_quantity, last_recount_date,
              created_at, updated_at
          `;

          stockLevel = getRows(updateResult)[0] as StockLevel;
        }

        // Create stock movement record
        await sql`
          INSERT INTO stock_movements (
            product_id,
            product_variation_id,
            location_id,
            quantity,
            type,
            reference_id,
            reference_type,
            notes,
            created_by,
            created_at
          ) VALUES (
            ${productId},
            ${variationId || null},
            ${locationId},
            ${quantity},
            ${quantity > 0 ? 'Received' : 'Adjusted'},
            ${referenceId || null},
            ${referenceType || null},
            ${notes || null},
            ${userId},
            NOW()
          )
        `;

        // Commit transaction
        await sql`COMMIT`;

        return stockLevel;
      } catch (error) {
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error(
        `Error adjusting inventory for product ${productId} at location ${locationId}:`,
        error
      );
      throw new Error(
        `Failed to adjust inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Reserve inventory for an order
   */
  async reserveInventory(
    items: Array<{ productId: number; variationId?: number; quantity: number }>,
    locationId: string,
    orderId: string,
    userId: string
  ): Promise<{
    success: boolean;
    errors: Array<{ productId: number; variationId?: number; message: string }>;
  }> {
    const errors: Array<{ productId: number; variationId?: number; message: string }> = [];

    try {
      // Start a transaction
      await sql`BEGIN`;

      try {
        for (const item of items) {
          // Check current stock level
          const stockResult = await sql`
            SELECT id, quantity, reserved_quantity
            FROM stock_levels
            WHERE 
              product_id = ${item.productId}
              AND location_id = ${locationId}
              ${item.variationId ? sql`AND product_variation_id = ${item.variationId}` : sql`AND product_variation_id IS NULL`}
          `;

          const stockRows = getRows(stockResult);

          if (stockRows.length === 0) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: 'No inventory record found',
            });
            continue;
          }

          const stockLevel = stockRows[0];
          const availableQuantity = stockLevel.quantity - stockLevel.reserved_quantity;

          if (availableQuantity < item.quantity) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: `Insufficient stock: requested ${item.quantity}, available ${availableQuantity}`,
            });
            continue;
          }

          // Update reserved quantity
          await sql`
            UPDATE stock_levels
            SET 
              reserved_quantity = reserved_quantity + ${item.quantity},
              updated_at = NOW()
            WHERE id = ${stockLevel.id}
          `;

          // Create stock movement record
          await sql`
            INSERT INTO stock_movements (
              product_id,
              product_variation_id,
              location_id,
              quantity,
              type,
              reference_id,
              reference_type,
              notes,
              created_by,
              created_at
            ) VALUES (
              ${item.productId},
              ${item.variationId || null},
              ${locationId},
              ${item.quantity},
              'Reserved',
              ${orderId},
              'Order',
              'Stock reserved for order',
              ${userId},
              NOW()
            )
          `;
        }

        // Commit transaction
        await sql`COMMIT`;

        return {
          success: errors.length === 0,
          errors,
        };
      } catch (error) {
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error(`Error reserving inventory for order ${orderId}:`, error);
      throw new Error(
        `Failed to reserve inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fulfill inventory for an order (convert reserved to fulfilled)
   */
  async fulfillInventory(
    items: Array<{ productId: number; variationId?: number; quantity: number }>,
    locationId: string,
    orderId: string,
    userId: string
  ): Promise<{
    success: boolean;
    errors: Array<{ productId: number; variationId?: number; message: string }>;
  }> {
    const errors: Array<{ productId: number; variationId?: number; message: string }> = [];

    try {
      // Start a transaction
      await sql`BEGIN`;

      try {
        for (const item of items) {
          // Check current stock level
          const stockResult = await sql`
            SELECT id, quantity, reserved_quantity
            FROM stock_levels
            WHERE 
              product_id = ${item.productId}
              AND location_id = ${locationId}
              ${item.variationId ? sql`AND product_variation_id = ${item.variationId}` : sql`AND product_variation_id IS NULL`}
          `;

          const stockRows = getRows(stockResult);

          if (stockRows.length === 0) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: 'No inventory record found',
            });
            continue;
          }

          const stockLevel = stockRows[0];

          if (stockLevel.reserved_quantity < item.quantity) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: `Insufficient reserved stock: requested ${item.quantity}, reserved ${stockLevel.reserved_quantity}`,
            });
            continue;
          }

          // Update quantities
          await sql`
            UPDATE stock_levels
            SET 
              quantity = quantity - ${item.quantity},
              reserved_quantity = reserved_quantity - ${item.quantity},
              updated_at = NOW()
            WHERE id = ${stockLevel.id}
          `;

          // Create stock movement record
          await sql`
            INSERT INTO stock_movements (
              product_id,
              product_variation_id,
              location_id,
              quantity,
              type,
              reference_id,
              reference_type,
              notes,
              created_by,
              created_at
            ) VALUES (
              ${item.productId},
              ${item.variationId || null},
              ${locationId},
              ${-item.quantity},
              'Fulfilled',
              ${orderId},
              'Order',
              'Stock fulfilled for order',
              ${userId},
              NOW()
            )
          `;
        }

        // Commit transaction
        await sql`COMMIT`;

        return {
          success: errors.length === 0,
          errors,
        };
      } catch (error) {
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error(`Error fulfilling inventory for order ${orderId}:`, error);
      throw new Error(
        `Failed to fulfill inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(
    productId: number,
    sourceLocationId: string,
    targetLocationId: string,
    quantity: number,
    userId: string,
    notes?: string,
    variationId?: number,
    referenceId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Start a transaction
      await sql`BEGIN`;

      try {
        // Check source location stock
        const sourceResult = await sql`
          SELECT id, quantity, reserved_quantity
          FROM stock_levels
          WHERE 
            product_id = ${productId}
            AND location_id = ${sourceLocationId}
            ${variationId ? sql`AND product_variation_id = ${variationId}` : sql`AND product_variation_id IS NULL`}
        `;

        const sourceRows = getRows(sourceResult);

        if (sourceRows.length === 0) {
          await sql`ROLLBACK`;
          return {
            success: false,
            message: 'No inventory record found at source location',
          };
        }

        const sourceStock = sourceRows[0];
        const availableQuantity = sourceStock.quantity - sourceStock.reserved_quantity;

        if (availableQuantity < quantity) {
          await sql`ROLLBACK`;
          return {
            success: false,
            message: `Insufficient stock at source location: requested ${quantity}, available ${availableQuantity}`,
          };
        }

        // Reduce stock at source location
        await sql`
          UPDATE stock_levels
          SET 
            quantity = quantity - ${quantity},
            updated_at = NOW()
          WHERE id = ${sourceStock.id}
        `;

        // Create stock movement record for source
        await sql`
          INSERT INTO stock_movements (
            product_id,
            product_variation_id,
            location_id,
            quantity,
            type,
            reference_id,
            reference_type,
            notes,
            created_by,
            created_at
          ) VALUES (
            ${productId},
            ${variationId || null},
            ${sourceLocationId},
            ${-quantity},
            'Transferred',
            ${referenceId || null},
            'Transfer',
            ${notes ? `${notes} (Transfer to ${targetLocationId})` : `Transfer to ${targetLocationId}`},
            ${userId},
            NOW()
          )
        `;

        // Check target location stock
        const targetResult = await sql`
          SELECT id, quantity
          FROM stock_levels
          WHERE 
            product_id = ${productId}
            AND location_id = ${targetLocationId}
            ${variationId ? sql`AND product_variation_id = ${variationId}` : sql`AND product_variation_id IS NULL`}
        `;

        const targetRows = getRows(targetResult);

        if (targetRows.length === 0) {
          // Create new stock record at target
          await sql`
            INSERT INTO stock_levels (
              product_id,
              product_variation_id,
              location_id,
              quantity,
              reserved_quantity,
              created_at,
              updated_at
            ) VALUES (
              ${productId},
              ${variationId || null},
              ${targetLocationId},
              ${quantity},
              0,
              NOW(),
              NOW()
            )
          `;
        } else {
          // Update existing target stock
          await sql`
            UPDATE stock_levels
            SET 
              quantity = quantity + ${quantity},
              updated_at = NOW()
            WHERE id = ${targetRows[0].id}
          `;
        }

        // Create stock movement record for target
        await sql`
          INSERT INTO stock_movements (
            product_id,
            product_variation_id,
            location_id,
            quantity,
            type,
            reference_id,
            reference_type,
            notes,
            created_by,
            created_at
          ) VALUES (
            ${productId},
            ${variationId || null},
            ${targetLocationId},
            ${quantity},
            'Transferred',
            ${referenceId || null},
            'Transfer',
            ${notes ? `${notes} (Transfer from ${sourceLocationId})` : `Transfer from ${sourceLocationId}`},
            ${userId},
            NOW()
          )
        `;

        // Commit transaction
        await sql`COMMIT`;

        return {
          success: true,
          message: `Successfully transferred ${quantity} units from ${sourceLocationId} to ${targetLocationId}`,
        };
      } catch (error) {
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error(`Error transferring inventory for product ${productId}:`, error);
      throw new Error(
        `Failed to transfer inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get low stock items based on reorder points
   */
  async getLowStockItems(): Promise<
    Array<StockLevel & { product_name: string; variation_name?: string }>
  > {
    try {
      const result = await sql`
        SELECT 
          sl.id,
          sl.product_id,
          sl.product_variation_id,
          sl.location_id,
          sl.quantity,
          sl.reserved_quantity,
          sl.reorder_point,
          sl.reorder_quantity,
          sl.last_recount_date,
          sl.created_at,
          sl.updated_at,
          p.name as product_name,
          pv.name as variation_name
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variations pv ON sl.product_variation_id = pv.id
        WHERE 
          sl.reorder_point IS NOT NULL 
          AND (sl.quantity - sl.reserved_quantity) <= sl.reorder_point
        ORDER BY (sl.quantity - sl.reserved_quantity) ASC
      `;

      return getRows(result) as Array<
        StockLevel & { product_name: string; variation_name?: string }
      >;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(
        `Failed to fetch low stock items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get stock movement history for a product
   */
  async getStockMovementHistory(
    productId: number,
    variationId?: number,
    locationId?: string,
    limit = 50,
    offset = 0
  ): Promise<{ movements: StockMovement[]; total: number }> {
    try {
      // Build the WHERE clause
      let whereClause = sql`WHERE sm.product_id = ${productId}`;

      if (variationId) {
        whereClause = sql`${whereClause} AND sm.product_variation_id = ${variationId}`;
      }

      if (locationId) {
        whereClause = sql`${whereClause} AND sm.location_id = ${locationId}`;
      }

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM stock_movements sm
        ${whereClause}
      `;

      const total = parseInt(getRows(countResult)[0].total);

      // Get movements with pagination
      const movementsResult = await sql`
        SELECT 
          sm.id,
          sm.product_id,
          sm.product_variation_id,
          sm.location_id,
          sm.quantity,
          sm.type,
          sm.reference_id,
          sm.reference_type,
          sm.notes,
          sm.created_by,
          sm.created_at,
          u.name as created_by_name
        FROM stock_movements sm
        LEFT JOIN users u ON sm.created_by = u.id
        ${whereClause}
        ORDER BY sm.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const movements = getRows(movementsResult) as (StockMovement & {
        created_by_name?: string;
      })[];

      return {
        movements,
        total,
      };
    } catch (error) {
      console.error(`Error fetching stock movement history for product ${productId}:`, error);
      throw new Error(
        `Failed to fetch stock movement history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create or update a stock location
   */
  async saveStockLocation(
    location: Omit<StockLocation, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<StockLocation> {
    try {
      if (location.id) {
        // Update existing location
        const updateResult = await sql`
          UPDATE stock_locations
          SET 
            name = ${location.name},
            address = ${location.address || null},
            type = ${location.type},
            is_active = ${location.is_active},
            updated_at = NOW()
          WHERE id = ${location.id}
          RETURNING id, name, address, type, is_active, created_at, updated_at
        `;

        return getRows(updateResult)[0] as StockLocation;
      } else {
        // Create new location
        const createResult = await sql`
          INSERT INTO stock_locations (
            name,
            address,
            type,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            ${location.name},
            ${location.address || null},
            ${location.type},
            ${location.is_active},
            NOW(),
            NOW()
          )
          RETURNING id, name, address, type, is_active, created_at, updated_at
        `;

        return getRows(createResult)[0] as StockLocation;
      }
    } catch (error) {
      console.error('Error saving stock location:', error);
      throw new Error(
        `Failed to save stock location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all stock locations
   */
  async getStockLocations(activeOnly = false): Promise<StockLocation[]> {
    try {
      const result = await sql`
        SELECT id, name, address, type, is_active, created_at, updated_at
        FROM stock_locations
        ${activeOnly ? sql`WHERE is_active = true` : sql``}
        ORDER BY name
      `;

      return getRows(result) as StockLocation[];
    } catch (error) {
      console.error('Error fetching stock locations:', error);
      throw new Error(
        `Failed to fetch stock locations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get inventory report by location
   */
  async getInventoryReportByLocation(): Promise<
    Array<{
      location_id: string;
      location_name: string;
      total_items: number;
      total_quantity: number;
      total_value: number;
    }>
  > {
    try {
      const result = await sql`
        SELECT 
          sl.location_id,
          l.name as location_name,
          COUNT(DISTINCT 
            CASE 
              WHEN sl.product_variation_id IS NULL THEN sl.product_id 
              ELSE sl.product_variation_id 
            END
          ) as total_items,
          SUM(sl.quantity) as total_quantity,
          SUM(
            CASE 
              WHEN sl.product_variation_id IS NULL THEN sl.quantity * p.price
              ELSE sl.quantity * pv.price
            END
          ) as total_value
        FROM stock_levels sl
        JOIN stock_locations l ON sl.location_id = l.id
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variations pv ON sl.product_variation_id = pv.id
        GROUP BY sl.location_id, l.name
        ORDER BY l.name
      `;

      return getRows(result) as Array<{
        location_id: string;
        location_name: string;
        total_items: number;
        total_quantity: number;
        total_value: number;
      }>;
    } catch (error) {
      console.error('Error generating inventory report by location:', error);
      throw new Error(
        `Failed to generate inventory report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get necessary database migrations for inventory system
   */
  getInventoryMigrations(): string {
    return `
-- Create stock_locations table
CREATE TABLE IF NOT EXISTS stock_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_levels table
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_variation_id INTEGER REFERENCES product_variations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  last_recount_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, product_variation_id, location_id)
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_variation_id INTEGER REFERENCES product_variations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id VARCHAR(255),
  reference_type VARCHAR(50),
  notes TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_variation ON stock_levels(product_variation_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON stock_levels(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variation ON stock_movements(product_variation_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Insert default warehouse location if none exists
INSERT INTO stock_locations (name, type, is_active) 
SELECT 'Main Warehouse', 'Warehouse', true
WHERE NOT EXISTS (SELECT 1 FROM stock_locations LIMIT 1);
    `;
  }
}
