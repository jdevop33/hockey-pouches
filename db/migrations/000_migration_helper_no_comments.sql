SELECT NOW() as migration_started;

DO $$
BEGIN
  RAISE NOTICE 'Starting migration tracker setup...';
END $$;

CREATE TABLE IF NOT EXISTS migration_history (
  migration_name VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION record_migration(migration_name VARCHAR)
RETURNS VOID AS $$
BEGIN
  INSERT INTO migration_history (migration_name) 
  VALUES (migration_name)
  ON CONFLICT (migration_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION has_migration(migration_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  found BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM migration_history WHERE migration_name = $1
  ) INTO found;
  RETURN found;
END;
$$ LANGUAGE plpgsql;

SELECT record_migration('000_migration_helper_no_comments.sql');

DO $$
BEGIN
  RAISE NOTICE 'Migration tracker setup complete!';
END $$;

SELECT * FROM migration_history; 