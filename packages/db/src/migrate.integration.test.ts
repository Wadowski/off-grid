// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FIXTURES, fixtureSources, startTestDatabase } from "../test/postgres.js";
import type { TestDatabase } from "../test/types.js";
import {
  MigrationChecksumError,
  MigrationFailedError,
  runMigrations,
  type MigrationSource,
} from "./index.js";

describe("runMigrations", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("applies every pending migration once and records it in the history table", async () => {
    const first = await runMigrations(db.migrator, fixtureSources());
    expect(first.applied).toEqual([
      "food/0001_ingredient.sql",
      "family/0001_family_setting.sql",
      "access/0001_access_grant.sql",
      "lists/0001_list.sql",
    ]);

    const history = await db.migrator.query<{ module: string; name: string }>(
      "SELECT module, name FROM public.schema_migrations ORDER BY module, name",
    );
    expect(history.rows).toHaveLength(4);
  });

  it("applies nothing on a second run", async () => {
    const second = await runMigrations(db.migrator, fixtureSources());
    expect(second.applied).toEqual([]);
  });

  it("creates each table as its module owner role, not as the migrator", async () => {
    const owners = await db.migrator.query<{ schemaname: string; tableowner: string }>(
      "SELECT schemaname, tableowner FROM pg_tables WHERE schemaname IN ('food', 'family', 'access', 'lists') ORDER BY schemaname",
    );
    expect(owners.rows).toEqual([
      { schemaname: "access", tableowner: "access_owner" },
      { schemaname: "family", tableowner: "family_owner" },
      { schemaname: "food", tableowner: "food_owner" },
      { schemaname: "lists", tableowner: "lists_owner" },
    ]);
  });

  it("refuses to run when an applied migration file has changed", async () => {
    const dir = await mkdtemp(join(tmpdir(), "offgrid-migrations-"));
    try {
      const source: MigrationSource = { schema: "family", directory: join(dir, "family") };
      await cp(`${FIXTURES}/family`, source.directory, { recursive: true });
      await runMigrations(db.migrator, [source]);

      await writeFile(
        join(source.directory, "0001_family_setting.sql"),
        (await readFile(join(source.directory, "0001_family_setting.sql"), "utf8")) +
          "\n-- edited\n",
      );
      await expect(runMigrations(db.migrator, [source])).rejects.toBeInstanceOf(
        MigrationChecksumError,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("rolls back a failing migration and records nothing for it", async () => {
    const source: MigrationSource = {
      schema: "access",
      directory: `${FIXTURES}/../broken/access`,
    };
    await expect(runMigrations(db.migrator, [source])).rejects.toBeInstanceOf(MigrationFailedError);

    const table = await db.migrator.query(
      "SELECT 1 FROM pg_tables WHERE schemaname = 'access' AND tablename = 'should_not_exist'",
    );
    expect(table.rows).toHaveLength(0);

    const history = await db.migrator.query(
      "SELECT 1 FROM public.schema_migrations WHERE module = 'access' AND name = '0001_broken.sql'",
    );
    expect(history.rows).toHaveLength(0);
  });
});
