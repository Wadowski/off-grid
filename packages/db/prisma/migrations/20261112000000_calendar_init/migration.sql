-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE calendar.calendar (
  calendar_id uuid        PRIMARY KEY,
  family_id   uuid,
  user_id     uuid,
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  created_at  timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('calendar', 'calendar', 'family-or-user');

CREATE TABLE calendar.calendar_event (
  event_id    uuid        PRIMARY KEY,
  calendar_id uuid        NOT NULL REFERENCES calendar.calendar (calendar_id),
  family_id   uuid,
  user_id     uuid,
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at >= starts_at)
);
CREATE INDEX calendar_event_calendar_id_idx ON calendar.calendar_event (calendar_id);
SELECT public.offgrid_declare_scope('calendar', 'calendar_event', 'family-or-user');

CREATE TABLE calendar.event_guest (
  event_id      uuid        NOT NULL REFERENCES calendar.calendar_event (event_id),
  guest_user_id uuid        NOT NULL,
  family_id     uuid,
  user_id       uuid,
  invited_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, guest_user_id)
);
SELECT public.offgrid_declare_scope('calendar', 'event_guest', 'family-or-user');

CREATE TABLE calendar.event_reminder (
  reminder_id uuid        PRIMARY KEY,
  event_id    uuid        NOT NULL REFERENCES calendar.calendar_event (event_id),
  family_id   uuid,
  user_id     uuid,
  remind_at   timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX event_reminder_event_id_idx ON calendar.event_reminder (event_id);
SELECT public.offgrid_declare_scope('calendar', 'event_reminder', 'family-or-user');

CREATE TABLE calendar.location (
  location_id uuid        PRIMARY KEY,
  family_id   uuid,
  user_id     uuid,
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  created_at  timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('calendar', 'location', 'family-or-user');
