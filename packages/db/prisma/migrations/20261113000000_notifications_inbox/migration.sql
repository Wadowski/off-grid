-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE notifications.notification (
  notification_id uuid        PRIMARY KEY,
  user_id         uuid        NOT NULL,
  type            text        NOT NULL CHECK (char_length(type) BETWEEN 1 AND 100),
  data            jsonb       NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  read_at         timestamptz
);
SELECT public.offgrid_declare_scope('notifications', 'notification', 'user');

CREATE INDEX notification_user_created_key ON notifications.notification (user_id, created_at);

INSERT INTO notifications.notification (notification_id, user_id, type, data, created_at, read_at)
SELECT notification_id, user_id, type, data, created_at, read_at
  FROM identity.notification;

DROP TABLE identity.notification;
