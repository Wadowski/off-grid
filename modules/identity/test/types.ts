// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import type { ModuleDatabase } from "@offgrid/db";

export interface IdentityTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  readonly db: ModuleDatabase;
  reset(): Promise<void>;
  stop(): Promise<void>;
}
