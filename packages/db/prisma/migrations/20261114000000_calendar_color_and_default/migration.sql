-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE calendar.calendar
  ADD COLUMN color      text    NOT NULL DEFAULT 'blue'
    CHECK (color IN ('blue', 'teal', 'green', 'amber', 'rose', 'violet')),
  ADD COLUMN is_default boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT calendar_default_is_personal CHECK (NOT is_default OR user_id IS NOT NULL);

ALTER TABLE calendar.calendar ALTER COLUMN color DROP DEFAULT;

CREATE UNIQUE INDEX calendar_one_default_per_user ON calendar.calendar (user_id) WHERE is_default;
