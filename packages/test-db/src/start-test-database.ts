// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readConnectionFile } from "./read-connection-file.js";
import { startPrivateTestDatabase } from "./start-private-test-database.js";
import { startSharedTestDatabase } from "./start-shared-test-database.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const connection = await readConnectionFile();
  return connection === undefined
    ? startPrivateTestDatabase()
    : startSharedTestDatabase(connection);
};
