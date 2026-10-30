// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase, type FamilyTestDatabase } from "../../test/postgres.js";
import {
  insertFamily,
  insertMembership,
  setFamilyContext,
  setUserContext,
  upsertSummary,
} from "./family-store.js";
import { withFamilyTransaction } from "./transaction.js";

describe("family schema isolation", () => {
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

  it("shows a family row only inside its own family context", async () => {
    const familyA = randomUUID();
    const familyB = randomUUID();
    await withFamilyTransaction(db.pool, async (client) => {
      await setFamilyContext(client, familyA);
      await insertFamily(client, { id: familyA, name: "A" });
    });

    const visibleToB = await withFamilyTransaction(db.pool, async (client) => {
      await setFamilyContext(client, familyB);
      const { rows } = await client.query("SELECT family_id FROM family.family");
      return rows;
    });
    const visibleToA = await withFamilyTransaction(db.pool, async (client) => {
      await setFamilyContext(client, familyA);
      const { rows } = await client.query("SELECT family_id FROM family.family");
      return rows;
    });

    expect(visibleToB).toEqual([]);
    expect(visibleToA).toHaveLength(1);
  });

  it("shows no rows when no family context is set", async () => {
    const familyId = randomUUID();
    await withFamilyTransaction(db.pool, async (client) => {
      await setFamilyContext(client, familyId);
      await insertFamily(client, { id: familyId, name: "Kitchen" });
    });

    const rows = await withFamilyTransaction(db.pool, async (client) => {
      const { rows: found } = await client.query("SELECT family_id FROM family.family");
      return found;
    });

    expect(rows).toEqual([]);
  });

  it("refuses a membership row that names another family", async () => {
    const familyId = randomUUID();
    const otherFamilyId = randomUUID();

    await expect(
      withFamilyTransaction(db.pool, async (client) => {
        await setFamilyContext(client, familyId);
        await insertFamily(client, { id: familyId, name: "Kitchen" });
        await insertMembership(client, otherFamilyId, randomUUID());
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it("refuses a summary row written for another user", async () => {
    await expect(
      withFamilyTransaction(db.pool, async (client) => {
        await setUserContext(client, randomUUID());
        await upsertSummary(client, {
          userId: randomUUID(),
          familyId: randomUUID(),
          name: "Kitchen",
          sourceVersion: 1,
        });
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it("refuses the module role access to another module's schema", async () => {
    await expect(
      withFamilyTransaction(db.pool, async (client) => {
        await client.query("SELECT 1 FROM outbox.event");
      }),
    ).rejects.toThrow(/permission denied/);
  });
});
