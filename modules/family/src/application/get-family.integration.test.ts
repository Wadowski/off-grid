// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { createFamily } from "./create-family.js";
import { getFamily } from "./get-family.js";

describe("getFamily", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("returns the family to a member", async () => {
    const creator = randomUUID();
    const family = await createFamily(db.db, creator, "Novak family");

    expect(await getFamily(db.db, creator, family.id)).toEqual({ outcome: "found", value: family });
  });

  it("reports a family to a non-member as not found", async () => {
    const family = await createFamily(db.db, randomUUID(), "Novak family");

    expect(await getFamily(db.db, randomUUID(), family.id)).toEqual({ outcome: "not-found" });
  });

  it("reports a family that does not exist as not found", async () => {
    expect(await getFamily(db.db, randomUUID(), randomUUID())).toEqual({ outcome: "not-found" });
  });
});
