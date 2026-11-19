-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE SCHEMA IF NOT EXISTS system AUTHORIZATION offgrid_migrator;
REVOKE ALL ON SCHEMA system FROM PUBLIC;
GRANT USAGE ON SCHEMA system TO offgrid_app;

CREATE TABLE system.update_settings (
  setting_key     text        PRIMARY KEY CHECK (setting_key = 'instance'),
  nightly_enabled boolean     NOT NULL DEFAULT false,
  latest_version  text,
  update_available boolean,
  update_allowed  boolean,
  checked_at      timestamptz
);
SELECT public.offgrid_declare_scope('system', 'update_settings', 'instance');

INSERT INTO system.update_settings (setting_key) VALUES ('instance');
