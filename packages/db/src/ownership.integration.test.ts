// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { assertOwnershipScopes, DATABASE_SCHEMAS } from "./index.js";

describe("assertOwnershipScopes", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("passes when every table declares a scope that matches its columns", async () => {
    await expect(assertOwnershipScopes(db.migrator, DATABASE_SCHEMAS)).resolves.toBeUndefined();
  });

  it("reports a table created without a declared scope", async () => {
    await db.migrator.query(
      "CREATE TABLE family.undeclared (id uuid PRIMARY KEY, family_id uuid NOT NULL)",
    );

    await expect(assertOwnershipScopes(db.migrator, ["family"])).rejects.toThrow(
      /family\.undeclared: no ownership scope declared/,
    );
  });

  it("refuses to declare an instance scope on a table with an owner column", async () => {
    await db.migrator.query(
      "CREATE TABLE family.owned_instance (id int PRIMARY KEY, user_id uuid)",
    );

    await expect(
      db.migrator.query(
        "SELECT public.offgrid_declare_scope('family', 'owned_instance', 'instance')",
      ),
    ).rejects.toThrow(/must not have an owner column/);
  });
});
