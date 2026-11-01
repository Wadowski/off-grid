// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { migrateDeploy } from "@offgrid/db";
import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import type { TestDatabase } from "./types.js";

const FAMILY_SUMMARY_FIXTURE = fileURLToPath(
  new URL("./fixtures/family-summary.sql", import.meta.url),
);

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const shared = await startSharedTestDatabase();
  await migrateDeploy(shared.migratorTarget);
  await shared.admin.query(await readFile(FAMILY_SUMMARY_FIXTURE, "utf8"));
  return shared;
};
