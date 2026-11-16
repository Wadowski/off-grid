// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { Context, TestDatabase } from "../test/types.js";

const readAs = async (pool: Pool, viewer: Context, sql: string, params: unknown[] = []) => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");
    if (viewer.familyId) {
      await client.query("SELECT set_config('app.family_id', $1, true)", [viewer.familyId]);
    }
    if (viewer.userId) {
      await client.query("SELECT set_config('app.user_id', $1, true)", [viewer.userId]);
    }
    const { rows } = await client.query<{ entity_id: string }>(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

describe("relations cross-entity link migration", () => {
  let db: TestDatabase;
  let app: Pool;

  const familyHome = randomUUID();
  const familyOther = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const cara = randomUUID();
  const familyEvent = randomUUID();
  const annaPrivateEvent = randomUUID();
  const otherFamilyEvent = randomUUID();
  const guestEvent = randomUUID();

  beforeAll(async () => {
    db = await startTestDatabase();
    app = db.connectPool();
    await db.admin.query(
      `INSERT INTO relations.family_member (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($1, $3, 1, true), ($4, $5, 1, true)`,
      [familyHome, anna, ben, familyOther, cara],
    );
    await db.admin.query(
      `INSERT INTO relations.linkable_entity (entity_type, entity_id, family_id, user_id, title, source_version) VALUES
         ('calendar-event', $1, $2, NULL, 'Family dinner', 1),
         ('calendar-event', $3, NULL, $4, 'Anna private', 1),
         ('calendar-event', $5, $6, NULL, 'Other family', 1),
         ('calendar-event', $7, NULL, $4, 'Guest review', 1)`,
      [familyEvent, familyHome, annaPrivateEvent, anna, otherFamilyEvent, familyOther, guestEvent],
    );
    await db.admin.query(
      `INSERT INTO relations.linkable_entity_guest (entity_type, entity_id, user_id, host_user_id)
       VALUES ('calendar-event', $1, $2, $3)`,
      [guestEvent, ben, anna],
    );
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("declares an ownership scope on every relations table", async () => {
    const { rows } = await db.admin.query<{ table_name: string; comment: string }>(
      `SELECT c.relname AS table_name, obj_description(c.oid, 'pg_class') AS comment
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'relations'
          AND c.relname IN ('linkable_entity', 'linkable_entity_guest', 'family_member', 'cross_entity_link')`,
    );
    const scopes = Object.fromEntries(rows.map((row) => [row.table_name, row.comment]));
    expect(scopes).toEqual({
      linkable_entity: "offgrid:scope=family-or-user",
      linkable_entity_guest: "offgrid:scope=user",
      family_member: "offgrid:scope=family",
      cross_entity_link: "offgrid:scope=family-or-user",
    });
  });

  it("rejects a projected entity that has both an owning family and an owning user", async () => {
    await expect(
      db.admin.query(
        `INSERT INTO relations.linkable_entity (entity_type, entity_id, family_id, user_id, title, source_version)
         VALUES ('calendar-event', $1, $2, $3, 'Both', 1)`,
        [randomUUID(), familyHome, anna],
      ),
    ).rejects.toThrow();
  });

  it("hides a family event from another family and shows it to a member of its family", async () => {
    const asMember = await readAs(
      app,
      { familyId: familyHome },
      "SELECT entity_id FROM relations.linkable_entity WHERE entity_type = 'calendar-event'",
    );
    const asOther = await readAs(
      app,
      { familyId: familyOther },
      "SELECT entity_id FROM relations.linkable_entity WHERE entity_type = 'calendar-event'",
    );
    expect(asMember.map((row) => row.entity_id)).toContain(familyEvent);
    expect(asOther.map((row) => row.entity_id)).not.toContain(familyEvent);
  });

  it("hides a private event from other people and shows it to its owner", async () => {
    const asOwner = await readAs(
      app,
      { userId: anna },
      "SELECT entity_id FROM relations.linkable_entity",
    );
    const asOther = await readAs(
      app,
      { userId: cara },
      "SELECT entity_id FROM relations.linkable_entity",
    );
    expect(asOwner.map((row) => row.entity_id)).toContain(annaPrivateEvent);
    expect(asOther.map((row) => row.entity_id)).not.toContain(annaPrivateEvent);
  });

  it("shows a guest the event they were invited to while they share a family with the host", async () => {
    const asGuest = await readAs(
      app,
      { userId: ben },
      "SELECT entity_id FROM relations.linkable_entity",
    );
    expect(asGuest.map((row) => row.entity_id)).toContain(guestEvent);
  });

  it("hides a guest event from a guest who no longer shares a family with the host", async () => {
    const outsider = randomUUID();
    await db.admin.query(
      `INSERT INTO relations.linkable_entity_guest (entity_type, entity_id, user_id, host_user_id)
       VALUES ('calendar-event', $1, $2, $3)`,
      [guestEvent, outsider, anna],
    );
    const asOutsider = await readAs(
      app,
      { userId: outsider },
      "SELECT entity_id FROM relations.linkable_entity",
    );
    expect(asOutsider.map((row) => row.entity_id)).not.toContain(guestEvent);
  });

  it("refuses a link from an entity to itself", async () => {
    await expect(
      db.admin.query(
        `INSERT INTO relations.cross_entity_link (link_id, source_type, source_id, target_type, target_id, family_id, user_id, created_by)
         VALUES ($1, 'calendar-event', $2, 'calendar-event', $2, $3, NULL, $4)`,
        [randomUUID(), familyEvent, familyHome, anna],
      ),
    ).rejects.toThrow();
  });
});
