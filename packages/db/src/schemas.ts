// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

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

export function ownerRoleOf(schema: DatabaseSchema): string {
  return `${schema}_owner`;
}

export function appRoleOf(schema: DatabaseSchema): string {
  return `${schema}_app`;
}

export function isDatabaseSchema(value: string): value is DatabaseSchema {
  return (DATABASE_SCHEMAS as readonly string[]).includes(value);
}
