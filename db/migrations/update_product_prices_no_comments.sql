CREATE TABLE IF NOT EXISTS product_price_backup (
    product_id INTEGER PRIMARY KEY,
    original_price DECIMAL(10, 2),
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_price_backup (product_id, original_price)
SELECT id, price FROM products
WHERE NOT EXISTS (
    SELECT 1 FROM product_price_backup WHERE product_id = products.id
);

CREATE TABLE IF NOT EXISTS variation_price_backup (
    variation_id INTEGER PRIMARY KEY,
    original_price DECIMAL(10, 2),
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO variation_price_backup (variation_id, original_price)
SELECT id, price FROM product_variations
WHERE NOT EXISTS (
    SELECT 1 FROM variation_price_backup WHERE variation_id = product_variations.id
);

UPDATE products SET price = 15.00, updated_at = CURRENT_TIMESTAMP;

UPDATE product_variations SET price = 15.00, updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS order_requirements (
    id SERIAL PRIMARY KEY,
    min_order_quantity INTEGER NOT NULL DEFAULT 5,
    applies_to_role VARCHAR(50) DEFAULT 'ALL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO order_requirements (min_order_quantity, applies_to_role)
SELECT 5, 'ALL'
WHERE NOT EXISTS (SELECT 1 FROM order_requirements WHERE applies_to_role = 'ALL' AND is_active = TRUE);

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