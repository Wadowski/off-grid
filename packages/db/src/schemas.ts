// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DATABASE_SCHEMAS } from "./schema-names.js";
import type { DatabaseSchema } from "./types.js";

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
