// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DATABASE_SCHEMAS } from "./constants.js";
import type { OWNERSHIP_SCOPES } from "./constants.js";

export type DatabaseSchema = (typeof DATABASE_SCHEMAS)[number];

export type OwnershipScope = (typeof OWNERSHIP_SCOPES)[number];

export interface SettingExecutor {
  $executeRawUnsafe(query: string, ...values: unknown[]): PromiseLike<unknown>;
}

export interface DatabaseTarget {
  host: string;
  port: number;
  database: string;
  password: string;
}

export interface MigrationSource {
  schema: DatabaseSchema;
  directory: string;
}

export interface Migration {
  schema: DatabaseSchema;
  name: string;
  sql: string;
  checksum: string;
}

export interface TableRow {
  schema: string;
  table: string;
  comment: string | null;
  rls: boolean;
  has_family: boolean;
  has_user: boolean;
}
