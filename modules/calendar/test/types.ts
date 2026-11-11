// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Client, Pool } from "pg";

export interface CalendarTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  readonly db: ModuleDatabase;
  reset(): Promise<void>;
  stop(): Promise<void>;
}
