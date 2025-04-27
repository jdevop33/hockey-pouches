ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'Customer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_balance DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_consignment_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS outstanding_debt DECIMAL(10,2) DEFAULT 0;

ALTER TABLE users ADD CONSTRAINT fk_users_referred_by 
    FOREIGN KEY (referred_by) REFERENCES users(referral_code) 
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role); 