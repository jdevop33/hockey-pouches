// app/api/admin/inventory/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/schema/products';
import { inventory } from '@/lib/schema/inventory';
import { products } from '@/lib/schema/products';
import { inventory } from '@/lib/schema/inventory';
import { products } from '@/lib/schema/products';
import { inventory } from '@/lib/schema/inventory';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
import { eq, and, or, ilike, count, desc, asc, gte, lte, sql as dSql, gt, lt, isNotNull, isNull, Placeholder, SQL } from 'drizzle-orm'; // Added isNotNull, isNull and SQL
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface InventoryViewItem {
  stockLevelId: string;
  productId: number;
  productVariationId: number | null;
  productName: string | null;
  variationName: string | null;
  locationId: string;
  locationName: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number | null;
  sku: string | null;
  imageUrl: string | null;
}

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        logger.info(`Admin GET /api/admin/inventory request`, { adminId: authResult.userId });

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;
        const locationIdFilter = searchParams.get('locationId');
        const productIdFilter = searchParams.get('productId');
        const variationIdFilter = searchParams.get('variationId');
        const lowStockFilter = searchParams.get('lowStock') === 'true';
        const outOfStockFilter = searchParams.get('outOfStock') === 'true';
        const searchQuery = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'productName';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? desc : asc;

        const conditions: (SQL<unknown> | Placeholder)[] = [];
        if (locationIdFilter) conditions.push(eq(schema.stockLevels.locationId, locationIdFilter));
        if (productIdFilter) conditions.push(eq(schema.stockLevels.productId, parseInt(productIdFilter)));
        if (variationIdFilter) conditions.push(eq(schema.stockLevels.productVariationId, parseInt(variationIdFilter)));

        const availableStockSql = dSql`${schema.stockLevels.quantity} - ${schema.stockLevels.reservedQuantity}`;
        if (lowStockFilter) {
            const lowStockThreshold = 10;
            conditions.push(
                or(
                    and( // If reorder point exists, check against it
                       isNotNull(schema.stockLevels.reorderPoint),
                       lt(availableStockSql, schema.stockLevels.reorderPoint)
                    ),
                    and( // If no reorder point, check against threshold (and > 0)
                        isNull(schema.stockLevels.reorderPoint),
                        gt(availableStockSql, 0),
                        lt(availableStockSql, lowStockThreshold)
                    )
                )
            );
        }
        if (outOfStockFilter) {
            conditions.push(lte(availableStockSql, 0));
        }
        if (searchQuery) {
            const searchTerm = `%${searchQuery}%`;
            conditions.push(or(
                ilike(schema.products.name, searchTerm),
                ilike(schema.productVariations.name, searchTerm),
                ilike(schema.productVariations.sku, searchTerm)
            ));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        let orderByClause: SQL<unknown> | SQL<unknown>[];
        switch (sortBy) {
            case 'locationName': orderByClause = sortOrder(schema.stockLocations.name); break;
            case 'variationName': orderByClause = sortOrder(schema.productVariations.name); break;
            case 'quantity': orderByClause = sortOrder(schema.stockLevels.quantity); break;
            case 'availableQuantity': orderByClause = sortOrder(availableStockSql); break;
            case 'sku': orderByClause = sortOrder(schema.productVariations.sku); break;
            default: orderByClause = sortOrder(schema.products.name); break;
        }

        const inventoryQuery = db.select({
          stockLevelId: schema.stockLevels.id,
          productId: schema.stockLevels.productId,
          productVariationId: schema.stockLevels.productVariationId,
          productName: schema.products.name,
          variationName: schema.productVariations.name,
          locationId: schema.stockLevels.locationId,
          locationName: schema.stockLocations.name,
          quantity: schema.stockLevels.quantity,
          reservedQuantity: schema.stockLevels.reservedQuantity,
          availableQuantity: availableStockSql,
          reorderPoint: schema.stockLevels.reorderPoint,
          sku: schema.productVariations.sku,
          imageUrl: schema.products.imageUrl
        })
            .from(schema.stockLevels)
            .leftJoin(schema.stockLocations, eq(schema.stockLevels.locationId, schema.stockLocations.id))
            .leftJoin(schema.productVariations, eq(schema.stockLevels.productVariationId, schema.productVariations.id))
            .leftJoin(schema.products, eq(schema.stockLevels.productId, schema.products.id))
            .where(whereClause)
            // Ensure orderBy is handled correctly (might need array)
            .orderBy(...(Array.isArray(orderByClause) ? orderByClause : [orderByClause]), asc(schema.stockLevels.id))
            .limit(limit)
            .offset(offset);

        const countQuery = db.select({ total: count() })
            .from(schema.stockLevels)
            .leftJoin(schema.stockLocations, eq(schema.stockLevels.locationId, schema.stockLocations.id))
            .leftJoin(schema.productVariations, eq(schema.stockLevels.productVariationId, schema.productVariations.id))
            .leftJoin(schema.products, eq(schema.stockLevels.productId, schema.products.id))
            .where(whereClause);

        const [inventoryResult, totalResult] = await Promise.all([inventoryQuery, countQuery]);
        const totalItems = totalResult[0]?.total ?? 0;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            inventory: inventoryResult as InventoryViewItem[],
            pagination: { page, limit, total: totalItems, totalPages },
        });
    } catch (error: any) {
        logger.error('Admin: Failed to get inventory list:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching inventory.' }, { status: 500 });
    }
}

// POST commented out
// Definitions for fields in db.select({...}) should be added back
