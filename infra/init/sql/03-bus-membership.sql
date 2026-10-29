-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

DO $$
DECLARE
  m text;
  modules text[] := ARRAY[
    'identity', 'family', 'access', 'calendar', 'lists', 'notes',
    'files', 'food', 'relations', 'notifications', 'export'
  ];
BEGIN
  FOREACH m IN ARRAY modules LOOP
    EXECUTE format('GRANT %I TO outbox_app', m || '_app');
  END LOOP;
END $$;
