// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseConnection } from "../src/types.js";

export interface TestDatabase {
  readonly connection: DatabaseConnection;
  stop(): Promise<void>;
}
