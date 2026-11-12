-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE calendar.calendar_event
  ADD COLUMN location    text    CHECK (location IS NULL OR char_length(location) BETWEEN 1 AND 200),
  ADD COLUMN description text    CHECK (description IS NULL OR char_length(description) BETWEEN 1 AND 2000),
  ADD COLUMN is_all_day  boolean NOT NULL DEFAULT false,
  ADD COLUMN version     integer NOT NULL DEFAULT 1 CHECK (version >= 1);

CREATE INDEX calendar_event_calendar_starts_idx ON calendar.calendar_event (calendar_id, starts_at);
