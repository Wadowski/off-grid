// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import type { EventOf } from "../src/types.js";
import type { familyCreated } from "./events.js";

export type AppSchema = "outbox" | "family";

export interface TestDatabase {
  readonly admin: Client;
  connect(schema: AppSchema): Pool;
  connectClient(schema: AppSchema): Promise<Client>;
  stop(): Promise<void>;
}

export type FamilyCreated = EventOf<typeof familyCreated>;
