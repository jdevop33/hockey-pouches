-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER DEFAULT NULL,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

-- Add discount_code field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON discount_codes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample discount codes for testing
INSERT INTO discount_codes (
    code, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date, 
    usage_limit, is_active
) VALUES 
('WELCOME10', 'Welcome discount 10% off', 'percentage', 10.00, 
 0.00, 50.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 
 NULL, TRUE),
('SUMMER2023', 'Summer sale $15 off', 'fixed_amount', 15.00, 
 50.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 
 100, TRUE);
