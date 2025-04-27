CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_date TIMESTAMP,
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions(order_id);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_user_id_fkey') THEN
            ALTER TABLE commissions ADD CONSTRAINT commissions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_order_id_fkey') THEN
            ALTER TABLE commissions ADD CONSTRAINT commissions_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES orders(id);
        END IF;
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION update_commissions_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commissions_modtime
BEFORE UPDATE ON commissions
FOR EACH ROW
EXECUTE FUNCTION update_commissions_modtime(); 