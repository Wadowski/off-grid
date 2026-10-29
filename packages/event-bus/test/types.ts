// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";

export type AppSchema = "outbox" | "family";

export interface TestDatabase {
  readonly admin: Client;
  connect(schema: AppSchema): Pool;
  connectClient(schema: AppSchema): Promise<Client>;
  stop(): Promise<void>;
}
