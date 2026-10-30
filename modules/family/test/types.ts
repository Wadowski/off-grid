// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client, Pool } from "pg";

export interface FamilyTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  reset(): Promise<void>;
  stop(): Promise<void>;
}
