BEGIN;

DO $$
BEGIN
  IF NOT has_migration('migration_name_here.sql') THEN
    -- Migration logic goes here
    
    -- Record this migration
    PERFORM record_migration('migration_name_here.sql');
  ELSE
    RAISE NOTICE 'Migration migration_name_here.sql already applied, skipping';
  END IF;
END $$;

COMMIT; 