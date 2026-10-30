// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import { createModuleDb } from "@offgrid/db";
import { startTestDatabase } from "@offgrid/test-db";
import { RESET_SQL } from "./constants.js";
import type { FamilyTestDatabase } from "./types.js";

const OUTBOX_MIGRATIONS = fileURLToPath(
  new URL("../../../packages/event-bus/migrations", import.meta.url),
);
const FAMILY_MIGRATIONS = fileURLToPath(
  new URL("../src/infrastructure/migrations", import.meta.url),
);

export const startFamilyTestDatabase = async (): Promise<FamilyTestDatabase> => {
  const database = await startTestDatabase({
    schemas: ["outbox", "family"],
    migrations: [
      { schema: "outbox", directory: OUTBOX_MIGRATIONS },
      { schema: "family", directory: FAMILY_MIGRATIONS },
    ],
  });
  const db = createModuleDb(database.target, "family");
  return {
    admin: database.admin,
    pool: database.connect("outbox"),
    db,
    reset: async () => {
      await database.admin.query(RESET_SQL);
    },
    stop: async () => {
      await db.$disconnect();
      await database.stop();
    },
  };
};
