-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE identity.attempt_counter (
  attempt_key   text        PRIMARY KEY,
  failures      integer     NOT NULL DEFAULT 0 CHECK (failures >= 0),
  locked_until  timestamptz,
  requested_at  timestamptz,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('identity', 'attempt_counter', 'instance');
