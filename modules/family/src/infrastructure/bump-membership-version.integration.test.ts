// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { bumpMembershipVersion } from "./bump-membership-version.js";

describe("bumpMembershipVersion", { timeout: 60_000 }, () => {
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

  it("keeps counting when a person leaves and rejoins, so the rejoin is not mistaken for an older change", async () => {
    const familyId = randomUUID();
    const userId = randomUUID();

    const versions = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      return [
        await bumpMembershipVersion(tx, familyId, userId),
        await bumpMembershipVersion(tx, familyId, userId),
        await bumpMembershipVersion(tx, familyId, userId),
      ];
    });

    expect(versions).toEqual([1, 2, 3]);
  });
});
