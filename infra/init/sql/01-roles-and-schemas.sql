-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

DO $$
DECLARE
  m text;
  modules text[] := ARRAY[
    'identity', 'family', 'access', 'calendar', 'lists', 'notes',
    'files', 'food', 'relations', 'notifications', 'export', 'outbox', 'observability'
  ];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'offgrid_migrator') THEN
    CREATE ROLE offgrid_migrator NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'offgrid_app') THEN
    CREATE ROLE offgrid_app NOLOGIN;
  END IF;

  FOREACH m IN ARRAY modules LOOP
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I AUTHORIZATION offgrid_migrator', m);
    EXECUTE format('REVOKE ALL ON SCHEMA %I FROM PUBLIC', m);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO offgrid_app', m);
  END LOOP;
END $$;

GRANT CREATE ON SCHEMA public TO offgrid_migrator;
