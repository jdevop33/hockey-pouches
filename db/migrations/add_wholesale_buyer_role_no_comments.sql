DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'user_role' 
        AND e.enumlabel = 'Wholesale Buyer'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'Wholesale Buyer';
    END IF;
END
$$;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_eligibility BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_approved_at TIMESTAMP;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wholesale_approved_by UUID REFERENCES users(id);

CREATE TABLE IF NOT EXISTS wholesale_requirements (
    id SERIAL PRIMARY KEY,
    min_order_quantity INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO wholesale_requirements (min_order_quantity)
SELECT 100
WHERE NOT EXISTS (SELECT 1 FROM wholesale_requirements WHERE is_active = TRUE);

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

CREATE INDEX IF NOT EXISTS idx_users_wholesale_eligibility ON users(wholesale_eligibility); 