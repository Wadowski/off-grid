// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import { MIGRATION_DIRECTORIES } from "./migration-directories.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> =>
  startSharedTestDatabase({
    schemas: ["outbox", "family"],
    migrations: MIGRATION_DIRECTORIES,
  });
