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

export interface MigratedTestDatabaseOptions {
  readonly migrate: (target: DatabaseTarget) => Promise<unknown>;
  readonly resetSql: string;
}

export interface MigratedTestDatabase {
  readonly admin: Client;
  connect(): Pool;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export interface SharedClusterConnection {
  readonly host: string;
  readonly port: number;
  readonly maintenanceDatabase: string;
  readonly adminUser: string;
  readonly adminPassword: string;
  readonly appPassword: string;
  readonly migratorPassword: string;
}

export interface IsolatedDatabase {
  readonly name: string;
  readonly admin: Client;
}
