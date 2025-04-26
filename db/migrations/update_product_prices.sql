-- Migration to update all product prices to $15

-- First, back up the current prices
CREATE TABLE IF NOT EXISTS product_price_backup (
    product_id INTEGER PRIMARY KEY,
    original_price DECIMAL(10, 2),
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Back up product prices if not already done
INSERT INTO product_price_backup (product_id, original_price)
SELECT id, price FROM products
WHERE NOT EXISTS (
    SELECT 1 FROM product_price_backup WHERE product_id = products.id
);

-- Create a backup table for variation prices if it doesn't exist
CREATE TABLE IF NOT EXISTS variation_price_backup (
    variation_id INTEGER PRIMARY KEY,
    original_price DECIMAL(10, 2),
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Back up variation prices if not already done
INSERT INTO variation_price_backup (variation_id, original_price)
SELECT id, price FROM product_variations
WHERE NOT EXISTS (
    SELECT 1 FROM variation_price_backup WHERE variation_id = product_variations.id
);

-- Update all products to $15
UPDATE products SET price = 15.00, updated_at = CURRENT_TIMESTAMP;

-- Update all product variations to $15
UPDATE product_variations SET price = 15.00, updated_at = CURRENT_TIMESTAMP;

-- Create a table to store the minimum order quantity
CREATE TABLE IF NOT EXISTS order_requirements (
    id SERIAL PRIMARY KEY,
    min_order_quantity INTEGER NOT NULL DEFAULT 5,
    applies_to_role VARCHAR(50) DEFAULT 'ALL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default minimum order if not exists
INSERT INTO order_requirements (min_order_quantity, applies_to_role)
SELECT 5, 'ALL'
WHERE NOT EXISTS (SELECT 1 FROM order_requirements WHERE applies_to_role = 'ALL' AND is_active = TRUE);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_requirements_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_requirements_modtime
BEFORE UPDATE ON order_requirements
FOR EACH ROW
EXECUTE FUNCTION update_order_requirements_modtime(); 