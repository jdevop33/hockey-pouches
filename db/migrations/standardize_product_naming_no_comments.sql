BEGIN;

UPDATE products
SET 
    name = CASE 
        WHEN name = 'PUXX Classic Mint' THEN 'PUXX Mint (22mg)'
        WHEN name = 'PUXX Peppermint' THEN 'PUXX Peppermint (22mg)'
        WHEN name = 'PUXX Spearmint' THEN 'PUXX Spearmint (22mg)'
        WHEN name = 'PUXX Watermelon' THEN 'PUXX Watermelon (16mg)'
        WHEN name = 'PUXX Cola' THEN 'PUXX Cola (16mg)'
        WHEN name = 'Apple Mint (12mg)' THEN 'PUXX Apple Mint (12mg)'
        WHEN name = 'Apple Mint (6mg)' THEN 'PUXX Apple Mint (6mg)'
        WHEN name = 'Mint (12mg)' THEN 'PUXX Mint (12mg)'
        WHEN name = 'Mint (6mg)' THEN 'PUXX Mint (6mg)'
        ELSE name
    END,
    
    image_url = CASE 
        WHEN name = 'PUXX Classic Mint' THEN '/images/products/puxx-mint-22mg.png'
        WHEN name = 'PUXX Peppermint' THEN '/images/products/puxx-peppermint-22mg.png'
        WHEN name = 'PUXX Spearmint' THEN '/images/products/puxx-spearmint-22mg.png'
        WHEN name = 'PUXX Watermelon' THEN '/images/products/puxx-watermelon-16mg.png'
        WHEN name = 'PUXX Cola' THEN '/images/products/puxx-cola-16mg.png'
        WHEN name = 'Apple Mint (12mg)' THEN '/images/products/puxx-apple-mint-12mg.png'
        WHEN name = 'Apple Mint (6mg)' THEN '/images/products/puxx-apple-mint-6mg.png'
        WHEN name = 'Mint (12mg)' THEN '/images/products/puxx-mint-12mg.png'
        WHEN name = 'Mint (6mg)' THEN '/images/products/puxx-mint-6mg.png'
        ELSE image_url
    END,
    
    updated_at = CURRENT_TIMESTAMP;

UPDATE products
SET 
    description = CASE
        WHEN name = 'PUXX Mint (22mg)' THEN 'Strong mint flavor with cooling effect. 22mg strength.'
        WHEN name = 'PUXX Peppermint (22mg)' THEN 'Crisp peppermint with exceptional clarity. 22mg strength.'
        WHEN name = 'PUXX Spearmint (22mg)' THEN 'Sophisticated spearmint with lasting freshness. 22mg strength.'
        WHEN name = 'PUXX Watermelon (16mg)' THEN 'Sweet and refreshing watermelon flavor. 16mg strength.'
        WHEN name = 'PUXX Cola (16mg)' THEN 'Classic cola flavor with a refreshing twist. 16mg strength.'
        WHEN name = 'PUXX Apple Mint (12mg)' THEN 'Crisp apple and cool mint flavor. 12mg strength.'
        WHEN name = 'PUXX Apple Mint (6mg)' THEN 'Crisp apple and cool mint flavor. 6mg strength.'
        WHEN name = 'PUXX Mint (12mg)' THEN 'Cool and refreshing mint flavor. 12mg strength.'
        WHEN name = 'PUXX Mint (6mg)' THEN 'Cool and refreshing mint flavor. 6mg strength.'
        ELSE description
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE description IS NULL OR description = '';

COMMENT ON TABLE products IS 'Product table following standardized naming convention: "Brand Flavor (StrengthMG)" for names and kebab-case for image filenames.';

COMMIT; 