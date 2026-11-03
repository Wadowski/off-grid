-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE identity.notification (
  notification_id uuid        PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES identity.user_account (user_id),
  type            text        NOT NULL CHECK (type IN ('password-changed', 'recovery-code-regenerated')),
  data            jsonb       NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  read_at         timestamptz
);
SELECT public.offgrid_declare_scope('identity', 'notification', 'user');

CREATE INDEX notification_user_created_key ON identity.notification (user_id, created_at);
