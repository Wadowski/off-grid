// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { createFamily } from "./create-family.js";

describe("createFamily", () => {
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

  it("stores the family with its creator as the first member and an outbox event", async () => {
    const creator = randomUUID();

    const family = await createFamily(db.db, creator, "Novak family");

    expect(family.name).toBe("Novak family");
    const { rows: members } = await db.admin.query(
      "SELECT user_id FROM family.family_member WHERE family_id = $1",
      [family.id],
    );
    expect(members).toEqual([{ user_id: creator }]);
    const { rows: events } = await db.admin.query(
      "SELECT type, family_id, payload FROM outbox.event WHERE family_id = $1",
      [family.id],
    );
    expect(events).toEqual([
      {
        type: "family-created-v1",
        family_id: family.id,
        payload: { name: "Novak family", creatorUserId: creator },
      },
    ]);
  });
});
