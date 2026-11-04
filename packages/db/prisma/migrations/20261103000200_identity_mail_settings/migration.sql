-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE identity.mail_settings (
  setting_key     text        PRIMARY KEY CHECK (setting_key = 'instance'),
  provider        text        NOT NULL CHECK (provider IN ('gmail', 'icloud', 'fastmail', 'other')),
  from_address    text        NOT NULL,
  smtp_host       text        NOT NULL,
  smtp_port       integer     NOT NULL CHECK (smtp_port BETWEEN 1 AND 65535),
  smtp_security   text        NOT NULL CHECK (smtp_security IN ('tls', 'starttls', 'none')),
  username        text        NOT NULL,
  password_sealed text        NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('identity', 'mail_settings', 'instance');
