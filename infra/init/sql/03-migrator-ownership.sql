-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I OWNER TO offgrid_migrator', current_database());
  EXECUTE 'ALTER FUNCTION public.offgrid_declare_scope(text, text, text) OWNER TO offgrid_migrator';
END $$;
