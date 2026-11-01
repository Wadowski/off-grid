-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE identity.user_account (
  user_id      uuid        PRIMARY KEY,
  email        text        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  display_name text        NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  instance_role text       NOT NULL CHECK (instance_role IN ('admin', 'user')),
  status       text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at   timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('identity', 'user_account', 'user');

CREATE UNIQUE INDEX user_account_email_key ON identity.user_account (lower(email));

CREATE TABLE identity.credential (
  user_id       uuid        PRIMARY KEY REFERENCES identity.user_account (user_id),
  password_hash text        NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  changed_at    timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('identity', 'credential', 'user');

CREATE TABLE identity.session (
  session_id    uuid        PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES identity.user_account (user_id),
  device_label  text        CHECK (char_length(device_label) BETWEEN 1 AND 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  revoked       boolean     NOT NULL DEFAULT false
);
SELECT public.offgrid_declare_scope('identity', 'session', 'user');

CREATE TABLE identity.recovery_code (
  recovery_code_id uuid        PRIMARY KEY,
  user_id          uuid        NOT NULL REFERENCES identity.user_account (user_id),
  code_hash        text        NOT NULL CHECK (char_length(code_hash) > 0),
  created_at       timestamptz NOT NULL DEFAULT now(),
  used_at          timestamptz,
  retired_at       timestamptz
);
SELECT public.offgrid_declare_scope('identity', 'recovery_code', 'user');

CREATE UNIQUE INDEX recovery_code_one_active_key ON identity.recovery_code (user_id)
  WHERE used_at IS NULL AND retired_at IS NULL;

CREATE TABLE identity.instance_settings (
  setting_key     text    PRIMARY KEY CHECK (setting_key = 'instance'),
  registration_open boolean NOT NULL
);
SELECT public.offgrid_declare_scope('identity', 'instance_settings', 'instance');

INSERT INTO identity.instance_settings (setting_key, registration_open) VALUES ('instance', true);

CREATE FUNCTION identity.user_count() RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, identity
AS $fn$
  SELECT count(*) FROM identity.user_account;
$fn$;

REVOKE ALL ON FUNCTION identity.user_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.user_count() TO offgrid_app;
