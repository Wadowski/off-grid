-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE observability.error_record (
  error_record_id uuid        PRIMARY KEY,
  recorded_at     timestamptz NOT NULL,
  name            text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 128),
  code            text        CHECK (code IS NULL OR char_length(code) BETWEEN 1 AND 128),
  trace_id        text        CHECK (trace_id IS NULL OR char_length(trace_id) BETWEEN 1 AND 128),
  context         jsonb       NOT NULL
);
CREATE INDEX error_record_recorded_at_idx ON observability.error_record (recorded_at);
SELECT public.offgrid_declare_scope('observability', 'error_record', 'instance');
