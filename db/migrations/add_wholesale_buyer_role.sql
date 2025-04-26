-- Add wholesale buyer role migration

-- Check if the role type already includes 'Wholesale Buyer'
DO $$
BEGIN
    -- Check if we need to alter the user_role type
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'user_role' 
        AND e.enumlabel = 'Wholesale Buyer'
    ) THEN
        -- Add 'Wholesale Buyer' to the user_role enum type
        ALTER TYPE user_role ADD VALUE 'Wholesale Buyer';
    END IF;
END
$$;

-- Add wholesale_eligibility field to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_eligibility BOOLEAN DEFAULT FALSE;

-- Add wholesale_approved_at timestamp to track when a user was approved for wholesale
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_approved_at TIMESTAMP;

-- Add wholesale_approved_by to track which admin approved the wholesale account
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_approved_by UUID REFERENCES users(id);

-- Create a new table to track wholesale order requirements
CREATE TABLE IF NOT EXISTS wholesale_requirements (
    id SERIAL PRIMARY KEY,
    min_order_quantity INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default wholesale requirement if not exists
INSERT INTO wholesale_requirements (min_order_quantity)
SELECT 100
WHERE NOT EXISTS (SELECT 1 FROM wholesale_requirements WHERE is_active = TRUE);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wholesale_requirements_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wholesale_requirements_modtime
BEFORE UPDATE ON wholesale_requirements
FOR EACH ROW
EXECUTE FUNCTION update_wholesale_requirements_modtime();

-- Add an index on the wholesale_eligibility column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wholesale_eligibility ON users(wholesale_eligibility); 