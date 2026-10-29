// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseConnection } from "../src/types.js";

export interface TestDatabase {
  readonly connection: DatabaseConnection;
  stop(): Promise<void>;
}

export interface StubOptions {
  readonly queryResult?: "ok" | "fail";
  readonly publisherRunning?: boolean;
  readonly ledgerRows?: readonly { module: string; name: string; checksum: string }[];
}
