// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const LOCK_SQL = "SELECT pg_advisory_lock(hashtext('offgrid_migrations'))";

export const UNLOCK_SQL = "SELECT pg_advisory_unlock(hashtext('offgrid_migrations'))";

export const DATABASE_SCHEMAS = [
  "identity",
  "family",
  "access",
  "calendar",
  "lists",
  "notes",
  "files",
  "food",
  "relations",
  "notifications",
  "export",
  "outbox",
] as const;

export const MIGRATOR_ROLE = "offgrid_migrator";

export const OWNERSHIP_SCOPES = ["family-or-user", "family", "user", "shared"] as const;

export const SCOPE_COMMENT = /^offgrid:scope=(.+)$/;

export const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;
