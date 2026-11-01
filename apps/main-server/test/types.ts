// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget } from "@offgrid/test-db";
import type { DatabaseConnection } from "../src/types.js";

export interface TestDatabase {
  readonly connection: DatabaseConnection;
  readonly migratorTarget: DatabaseTarget;
  stop(): Promise<void>;
}

export interface StubOptions {
  readonly queryResult?: "ok" | "fail";
  readonly publisherRunning?: boolean;
  readonly ledgerRows?: readonly { migration_name: string; checksum: string }[];
}
