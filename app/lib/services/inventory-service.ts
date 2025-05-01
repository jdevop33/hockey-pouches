import { db, sql } from '@/lib/db'; // Import db and sql
import { getRows, castDbRows, castDbRow, DbQueryResult } from '@/lib/db-types'; // Ensure DbQueryResult is imported

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
      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
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
      `);

      // Use HEAD version for return (castDbRows)
      return castDbRows<StockLevel[]>(getRows(result));
    } catch (error) {
      // Use HEAD version for catch (errorMsg, correct indentation)
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching inventory for product ${productId}:`, error);
      throw new Error(`Failed to fetch inventory: ${errorMsg}`);
    }
  }

  /**
   * Get inventory levels for a product variation across all locations
   */
  async getVariationInventory(variationId: number): Promise<StockLevel[]> {
    try {
      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      const result = await db.execute(sql`
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
      `);

      // Use HEAD version for return (castDbRows)
      return castDbRows<StockLevel[]>(getRows(result));
    } catch (error) {
      // Use HEAD version for catch (errorMsg, correct indentation)
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching inventory for variation ${variationId}:`, error);
      throw new Error(`Failed to fetch inventory: ${errorMsg}`);
    }
  }

  /**
   * Get inventory levels for a specific location
   */
  async getLocationInventory(locationId: string): Promise<StockLevel[]> {
    try {
      // Ensure db is not null
      if (!db) throw new Error('Database connection not available.');

      // Assuming includeVariations is not needed based on the simple query
      const result = await db.execute(sql`
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
      `);

      // Use HEAD version for return (castDbRows)
      return castDbRows<StockLevel[]>(getRows(result));
    } catch (error) {
      // Use HEAD version for catch (errorMsg, correct indentation)
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching inventory for location ${locationId}:`, error);
      throw new Error(`Failed to fetch inventory: ${errorMsg}`);
    }
  }

  /**
   * Adjust inventory levels for a product/variation at a location
   */
  async adjustInventory(
    productId: number, // Changed to number to match schema likely
    locationId: string,
    quantityChange: number, // Renamed for clarity
    userId: string,
    notes?: string,
    variationId?: number,
    referenceId?: string,
    referenceType?: string,
    movementType: StockMovementType = 'Adjusted' // Added movement type
  ): Promise<StockLevel> {
    // Ensure db is not null
    if (!db) throw new Error('Database connection not available.');

    return db
      .transaction(async tx => {
        logger.info('Adjusting inventory', {
          productId,
          variationId,
          locationId,
          quantityChange,
          userId,
        });

        // Fetch current stock level within transaction
        const currentLevel = await tx.query.stockLevels.findFirst({
          where: and(
            eq(schema.stockLevels.productId, productId),
            eq(schema.stockLevels.locationId, locationId),
            variationId
              ? eq(schema.stockLevels.productVariationId, variationId)
              : isNull(schema.stockLevels.productVariationId)
          ),
        });

        let newQuantity: number;
        let updatedLevel: StockLevel;

        if (currentLevel) {
          // Update existing stock level
          newQuantity = currentLevel.quantity + quantityChange;
          if (newQuantity < 0) {
            throw new Error(
              `Adjustment results in negative stock (${newQuantity}) for product ${productId} / variation ${variationId}`
            );
          }

          const updateResult = await tx
            .update(schema.stockLevels)
            .set({ quantity: newQuantity, updatedAt: new Date() })
            .where(eq(schema.stockLevels.id, currentLevel.id))
            .returning();

          if (updateResult.length === 0) {
            throw new Error('Failed to update stock level during adjustment.');
          }
          updatedLevel = castDbRow<StockLevel>(updateResult[0])!;
        } else {
          // Create new stock level if adjustment is positive
          if (quantityChange <= 0) {
            throw new Error(
              `Cannot create stock level with non-positive adjustment (${quantityChange}) for new item.`
            );
          }
          newQuantity = quantityChange;

          const insertResult = await tx
            .insert(schema.stockLevels)
            .values({
              id: uuidv4(), // Generate new UUID
              productId: productId,
              productVariationId: variationId,
              locationId: locationId,
              quantity: newQuantity,
              reservedQuantity: 0, // Initialize reserved quantity
              // Add other fields like reorder_point if necessary
            })
            .returning();

          if (insertResult.length === 0) {
            throw new Error('Failed to insert new stock level during adjustment.');
          }
          updatedLevel = castDbRow<StockLevel>(insertResult[0])!;
        }

        // Log the stock movement
        const movement: StockMovementInsert = {
          id: uuidv4(), // Generate new UUID
          productId: productId,
          productVariationId: variationId,
          locationId: locationId,
          quantity: quantityChange, // Log the change amount
          type: movementType,
          referenceId: referenceId,
          referenceType: referenceType,
          notes: notes,
          createdBy: userId,
        };
        await tx.insert(schema.stockMovements).values(movement);

        logger.info('Inventory adjusted successfully', {
          stockLevelId: updatedLevel.id,
          newQuantity,
        });
        return updatedLevel;
      })
      .catch(error => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Inventory adjustment failed', {
          productId,
          variationId,
          locationId,
          quantityChange,
          userId,
          error: errorMsg,
        });
        // Re-throw the error after logging
        throw new Error(`Inventory adjustment failed: ${errorMsg}`);
      });
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

          const stockRows = getRows(stockResult as unknown as DbQueryResult);

          if (
            Array.isArray(stockRows) ? (Array.isArray(stockRows) ? stockRows.length : 0) : 0 === 0
          ) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: 'No inventory record found',
            });
            continue;
          }

          const stockLevel = Array.isArray(stockRows)
            ? Array.isArray(stockRows)
              ? stockRows[0]
              : null
            : null;
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
          success: Array.isArray(errors) ? (Array.isArray(errors) ? errors.length : 0) : 0 === 0,
          errors,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error reserving inventory for order ${orderId}:`, error);
      throw new Error(`Failed to reserve inventory: ${errorMsg}`);
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

          const stockRows = getRows(stockResult as unknown as DbQueryResult);

          if (Array.isArray(stockRows) ? stockRows.length === 0 : true) {
            errors.push({
              productId: item.productId,
              variationId: item.variationId,
              message: 'No inventory record found',
            });
            continue;
          }

          const stockLevel = Array.isArray(stockRows) ? stockRows[0] : null;

          if (
            stockLevel &&
            typeof stockLevel.reserved_quantity === 'number' &&
            stockLevel.reserved_quantity < item.quantity
          ) {
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
            WHERE id = ${stockLevel?.id}
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fulfilling inventory for order ${orderId}:`, error);
      throw new Error(`Failed to fulfill inventory: ${errorMsg}`);
    }
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(
    productId: string,
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

        const sourceRows = getRows(sourceResult as unknown as DbQueryResult);

        if (
          Array.isArray(sourceRows) ? (Array.isArray(sourceRows) ? sourceRows.length : 0) : 0 === 0
        ) {
          await sql`ROLLBACK`;
          return {
            success: false,
            message: 'No inventory record found at source location',
          };
        }

        const sourceStock = Array.isArray(sourceRows)
          ? Array.isArray(sourceRows)
            ? sourceRows[0]
            : null
          : null;
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

        const targetRows = getRows(targetResult as unknown as DbQueryResult);

        if (
          Array.isArray(targetRows) ? (Array.isArray(targetRows) ? targetRows.length : 0) : 0 === 0
        ) {
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        // Rollback on error
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error transferring inventory for product ${productId}:`, error);
      throw new Error(`Failed to transfer inventory: ${errorMsg}`);
    }
  }

  /**
   * Get low stock items for reordering
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
          p.name as product_name,
          pv.name as variation_name
        FROM 
          stock_levels sl
          JOIN products p ON p.id = sl.product_id
          LEFT JOIN product_variations pv ON pv.id = sl.product_variation_id
        WHERE 
          sl.reorder_point IS NOT NULL
          AND sl.quantity - sl.reserved_quantity <= sl.reorder_point
        ORDER BY 
          (sl.quantity - sl.reserved_quantity) ASC
      `;

      const rows = getRows(result);
      return rows as unknown as Array<
        StockLevel & { product_name: string; variation_name?: string }
      >;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error fetching low stock items:', error);
      throw new Error(`Failed to fetch low stock items: ${errorMsg}`);
    }
  }

  /**
   * Get stock movement history for a product
   */
  async getStockMovementHistory(
    productId: string,
    variationId?: number,
    locationId?: string,
    limit = 50,
    offset = 0
  ): Promise<{ movements: Array<StockMovement & { created_by_name?: string }>; total: number }> {
    try {
      // Get count first for pagination
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM stock_movements
        WHERE product_id = ${productId}
        ${variationId ? sql`AND product_variation_id = ${variationId}` : sql``}
        ${locationId ? sql`AND location_id = ${locationId}` : sql``}
      `;

      const countRows = getRows(countResult);
      const total = countRows.length > 0 ? Number(countRows[0].total) || 0 : 0;

      // Get movements with user names
      const movementsResult = await sql`
        SELECT 
          sm.*,
          u.name as created_by_name
        FROM 
          stock_movements sm
          LEFT JOIN users u ON sm.created_by = u.id
        WHERE 
          sm.product_id = ${productId}
          ${variationId ? sql`AND sm.product_variation_id = ${variationId}` : sql``}
          ${locationId ? sql`AND sm.location_id = ${locationId}` : sql``}
        ORDER BY 
          sm.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const rows = getRows(movementsResult);
      const movements = rows as unknown as Array<StockMovement & { created_by_name?: string }>;

      return { movements, total };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching stock movement history for product ${productId}:`, error);
      throw new Error(`Failed to fetch stock movement history: ${errorMsg}`);
    }
  }

  /**
   * Save a stock location (create or update)
   */
  async saveStockLocation(location: {
    id?: string;
    name: string;
    address?: string;
    type: StockLocationType;
    is_active: boolean;
  }): Promise<StockLocation> {
    try {
      // If has ID, update existing location
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
          RETURNING *
        `;

        const rows = getRows(updateResult);
        return rows[0] as unknown as StockLocation;
      } else {
        // Create a new location
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
          RETURNING *
        `;

        const rows = getRows(createResult);
        return rows[0] as unknown as StockLocation;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error saving stock location:', error);
      throw new Error(`Failed to save stock location: ${errorMsg}`);
    }
  }

  /**
   * Get all stock locations
   * @param activeOnly Flag to return only active locations
   */
  async getStockLocations(activeOnly = false): Promise<StockLocation[]> {
    try {
      const result = await sql`
        SELECT 
          id, 
          name, 
          address, 
          type, 
          is_active, 
          created_at, 
          updated_at
        FROM stock_locations
        ${activeOnly ? sql`WHERE is_active = true` : sql``}
        ORDER BY name ASC
      `;

      const rows = getRows(result);
      return rows as unknown as StockLocation[];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error fetching stock locations:', error);
      throw new Error(`Failed to fetch stock locations: ${errorMsg}`);
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

      return castDbRows<
        Array<{
          location_id: string;
          location_name: string;
          total_items: number;
          total_quantity: number;
          total_value: number;
        }>
      >(getRows(result));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error generating inventory report by location:', error);
      throw new Error(`Failed to generate inventory report: ${errorMsg}`);
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
