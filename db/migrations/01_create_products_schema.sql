-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  image_url VARCHAR(255),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  flavor VARCHAR(100),
  strength INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on frequently queried fields
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_is_active_idx ON products(is_active);
CREATE INDEX products_price_idx ON products(price);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to products table
CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add trigger to categories table
CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
('Strong', 'High strength products for experienced users'),
('Medium', 'Medium strength products for regular users'),
('Mild', 'Lower strength products for casual users'),
('Regular Strength', 'Standard strength for everyday use')
ON CONFLICT (name) DO NOTHING;

-- Insert initial products
INSERT INTO products (
  name, 
  description, 
  price, 
  image_url, 
  category_id,
  flavor, 
  strength
) VALUES
(
  'PUXX Classic Mint', 
  'Refined flavor profile with subtle cooling effect.',
  15.00,
  '/images/products/puxxcoolmint22mg.png',
  (SELECT id FROM categories WHERE name = 'Strong'),
  'Mint',
  22
),
(
  'PUXX Peppermint', 
  'Crisp peppermint with exceptional clarity.',
  15.00,
  '/images/products/puxxperpermint22mg.png',
  (SELECT id FROM categories WHERE name = 'Strong'),
  'Peppermint',
  22
),
(
  'PUXX Spearmint', 
  'Sophisticated spearmint with lasting freshness.',
  15.00,
  '/images/products/puxxspearmint22mg.png',
  (SELECT id FROM categories WHERE name = 'Strong'),
  'Spearmint',
  22
),
(
  'PUXX Watermelon', 
  'Sweet and refreshing watermelon flavor.',
  15.00,
  '/images/products/puxxwatermelon16mg.png',
  (SELECT id FROM categories WHERE name = 'Medium'),
  'Watermelon',
  16
),
(
  'PUXX Cola', 
  'Classic cola flavor with a refreshing twist.',
  15.00,
  '/images/products/puxxcola16mg.png',
  (SELECT id FROM categories WHERE name = 'Medium'),
  'Cola',
  16
),
(
  'Apple Mint (12mg)', 
  'Crisp apple and cool mint flavor.',
  15.00,
  '/images/products/apple-mint/apple-mint-12mg.png',
  (SELECT id FROM categories WHERE name = 'Regular Strength'),
  'Apple Mint',
  12
),
(
  'Apple Mint (6mg)', 
  'Crisp apple and cool mint flavor, lower strength.',
  15.00,
  '/images/products/apple-mint/apple-mint-6mg.png',
  (SELECT id FROM categories WHERE name = 'Mild'),
  'Apple Mint',
  6
),
(
  'Mint (12mg)', 
  'Cool and refreshing mint flavor.',
  15.00,
  '/images/products/cool-mint-6mg.png',
  (SELECT id FROM categories WHERE name = 'Regular Strength'),
  'Mint',
  12
),
(
  'Mint (6mg)', 
  'Cool and refreshing mint flavor, lower strength.',
  15.00,
  '/images/products/cool-mint-6mg.png',
  (SELECT id FROM categories WHERE name = 'Mild'),
  'Mint',
  6
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category_id = EXCLUDED.category_id,
  flavor = EXCLUDED.flavor,
  strength = EXCLUDED.strength,
  updated_at = CURRENT_TIMESTAMP; 