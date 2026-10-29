// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

/**
 * Every Postgres schema in the `offgrid` database, one per module plus `outbox`
 * (owned by the event bus). Must match `infra/init/sql/01-roles-and-schemas.sql`
 * and the `schemas` list in `prisma/schema.prisma`.
 */
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

export type DatabaseSchema = (typeof DATABASE_SCHEMAS)[number];

export const MIGRATOR_ROLE = "offgrid_migrator";

/** Role that owns a schema and runs its migrations. */
export function ownerRoleOf(schema: DatabaseSchema): string {
  return `${schema}_owner`;
}

/** Runtime role for a schema: DML on its own schema only. */
export function appRoleOf(schema: DatabaseSchema): string {
  return `${schema}_app`;
}

export function isDatabaseSchema(value: string): value is DatabaseSchema {
  return (DATABASE_SCHEMAS as readonly string[]).includes(value);
}
