-- Add payment tracking fields to the payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_number VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_details JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index on reference_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference_number ON payments(reference_number);

-- Add a tasks table for tracking payment verification and order processing tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
  category VARCHAR(50) NOT NULL,
  related_to VARCHAR(50) NOT NULL,
  related_id INTEGER NOT NULL,
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_related_to_id ON tasks(related_to, related_id);
