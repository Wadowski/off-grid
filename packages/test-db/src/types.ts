// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import type { DatabaseSchema, DatabaseTarget, ModuleDatabase } from "@offgrid/db";

export interface MigrationDirectory {
  readonly schema: DatabaseSchema;
  readonly directory: string;
}

export interface StartOptions {
  readonly schemas: readonly DatabaseSchema[];
  readonly migrations: readonly MigrationDirectory[];
}

export interface TestDatabase {
  readonly admin: Client;
  readonly target: DatabaseTarget;
  connect(schema: DatabaseSchema): Pool;
  connectClient(schema: DatabaseSchema): Promise<Client>;
  moduleDb(schema: DatabaseSchema): ModuleDatabase;
  stop(): Promise<void>;
}
