// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase } from "../../test/start-family-test-database.js";
import type { FamilyTestDatabase } from "../../test/types.js";
import { createFamily } from "./create-family.js";
import { getFamily } from "./get-family.js";

describe("getFamily", () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it("returns the family to a member", async () => {
    const creator = randomUUID();
    const family = await createFamily(db.pool, creator, "Novak family");

    expect(await getFamily(db.pool, creator, family.id)).toEqual({
      outcome: "found",
      value: family,
    });
  });

  it("forbids a user who is not a member", async () => {
    const family = await createFamily(db.pool, randomUUID(), "Novak family");

    expect(await getFamily(db.pool, randomUUID(), family.id)).toEqual({ outcome: "forbidden" });
  });

  it("reports a family that does not exist", async () => {
    expect(await getFamily(db.pool, randomUUID(), randomUUID())).toEqual({ outcome: "not-found" });
  });
});
