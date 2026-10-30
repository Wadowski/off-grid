// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase, type FamilyTestDatabase } from "../../test/postgres.js";
import { InvalidFamilyNameError } from "../domain/family.js";
import { createFamilyService, type FamilyService } from "./family-service.js";

describe("family service", () => {
  let db: FamilyTestDatabase;
  let service: FamilyService;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
    service = createFamilyService(db.pool);
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it("creates a family with its creator as the first member and an outbox event", async () => {
    const creator = randomUUID();

    const family = await service.createFamily(creator, "Novak family");

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

  it("rejects an invalid name without writing anything", async () => {
    await expect(service.createFamily(randomUUID(), "   ")).rejects.toThrow(InvalidFamilyNameError);

    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM family.family");
    expect(rows[0]).toEqual({ n: 0 });
  });

  it("lets a member view the family", async () => {
    const creator = randomUUID();
    const family = await service.createFamily(creator, "Novak family");

    const view = await service.getFamily(creator, family.id);

    expect(view).toEqual({ outcome: "found", family });
  });

  it("denies a user who is not a member", async () => {
    const family = await service.createFamily(randomUUID(), "Novak family");

    expect(await service.getFamily(randomUUID(), family.id)).toEqual({ outcome: "forbidden" });
  });

  it("reports a family that does not exist", async () => {
    expect(await service.getFamily(randomUUID(), randomUUID())).toEqual({ outcome: "not-found" });
  });
});
