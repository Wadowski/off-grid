// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase, fixtureSources } from "../test/postgres.js";
import type { TestDatabase } from "../test/types.js";
import { assertOwnershipScopes, runMigrations } from "./index.js";

describe("assertOwnershipScopes", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase();
    await runMigrations(db.migrator, fixtureSources());
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("passes when every table declares a scope that matches its columns", async () => {
    await expect(
      assertOwnershipScopes(db.migrator, ["food", "family", "access", "lists"]),
    ).resolves.toBeUndefined();
  });

  it("reports a table created without a declared scope", async () => {
    await db.migrator.query("SET ROLE family_owner");
    try {
      await db.migrator.query(
        "CREATE TABLE family.undeclared (id uuid PRIMARY KEY, family_id uuid NOT NULL)",
      );
    } finally {
      await db.migrator.query("RESET ROLE");
    }

    await expect(assertOwnershipScopes(db.migrator, ["family"])).rejects.toThrow(
      /family\.undeclared: no ownership scope declared/,
    );
  });
});
