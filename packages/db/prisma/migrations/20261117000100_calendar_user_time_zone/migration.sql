-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE calendar.user_time_zone (
  user_id    uuid        PRIMARY KEY,
  time_zone  text        NOT NULL CHECK (char_length(time_zone) BETWEEN 1 AND 64),
  updated_at timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('calendar', 'user_time_zone', 'user');
