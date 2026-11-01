// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { loadMigrations, migrateDeploy, PRISMA_MIGRATIONS_DIRECTORY } from "./index.js";

const DEPLOY_TIMEOUT_MS = 60_000;

describe("migrateDeploy", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase({ migrate: false });
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it(
    "applies every migration and records each in Prisma's history table",
    async () => {
      await migrateDeploy(db.migratorTarget);

      const history = await db.admin.query<{ migration_name: string; checksum: string }>(
        "SELECT migration_name, checksum FROM public._prisma_migrations ORDER BY migration_name",
      );
      const expected = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
      expect(history.rows).toEqual(
        expected.map((migration) => ({
          migration_name: migration.name,
          checksum: migration.checksum,
        })),
      );
    },
    DEPLOY_TIMEOUT_MS,
  );

  it(
    "applies nothing on a second run",
    async () => {
      await migrateDeploy(db.migratorTarget);

      const history = await db.admin.query("SELECT 1 FROM public._prisma_migrations");
      const expected = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
      expect(history.rowCount).toBe(expected.length);
    },
    DEPLOY_TIMEOUT_MS,
  );

  it("creates every table as the migrator, not as the runtime role", async () => {
    const owners = await db.admin.query<{ schemaname: string; tableowner: string }>(
      "SELECT schemaname, tableowner FROM pg_tables WHERE schemaname IN ('family', 'outbox') ORDER BY schemaname, tablename",
    );
    expect(owners.rows.length).toBeGreaterThan(0);
    expect(new Set(owners.rows.map((row) => row.tableowner))).toEqual(
      new Set(["offgrid_migrator"]),
    );
  });
});
