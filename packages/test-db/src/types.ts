// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";

export interface MigrationDirectory {
  readonly schema: string;
  readonly directory: string;
}

export interface StartOptions {
  readonly schemas: readonly string[];
  readonly migrations: readonly MigrationDirectory[];
}

export interface DatabaseTarget {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly password: string;
}

export interface TestDatabase {
  readonly admin: Client;
  readonly target: DatabaseTarget;
  connect(schema: string): Pool;
  connectClient(schema: string): Promise<Client>;
  stop(): Promise<void>;
}
