// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";

export interface DatabaseTarget {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
}

export interface TestDatabase {
  readonly admin: Client;
  readonly target: DatabaseTarget;
  readonly migratorTarget: DatabaseTarget;
  connect(): Pool;
  connectClient(): Promise<Client>;
  stop(): Promise<void>;
}
