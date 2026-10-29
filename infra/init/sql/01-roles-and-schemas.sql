-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

DO $$
DECLARE
  m text;
  modules text[] := ARRAY[
    'identity', 'family', 'access', 'calendar', 'lists', 'notes',
    'files', 'food', 'relations', 'notifications', 'export', 'outbox'
  ];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'offgrid_migrator') THEN
    CREATE ROLE offgrid_migrator NOLOGIN;
  END IF;

  FOREACH m IN ARRAY modules LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = m || '_owner') THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', m || '_owner');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = m || '_app') THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', m || '_app');
    END IF;

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I AUTHORIZATION %I', m, m || '_owner');
    EXECUTE format('REVOKE ALL ON SCHEMA %I FROM PUBLIC', m);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', m, m || '_app');

    EXECUTE format('GRANT %I TO offgrid_migrator', m || '_owner');
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  module      text        NOT NULL,
  name        text        NOT NULL,
  checksum    text        NOT NULL,
  applied_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (module, name)
);

ALTER TABLE public.schema_migrations OWNER TO offgrid_migrator;
REVOKE ALL ON public.schema_migrations FROM PUBLIC;
