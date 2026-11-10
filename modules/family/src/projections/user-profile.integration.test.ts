// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamily } from "../application/create-family.js";
import { listFamilyMembers } from "../application/list-family-members.js";
import { upsertUserProfile } from "./upsert-user-profile.js";

describe("user profile projection", { timeout: 60_000 }, () => {
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

  const applyProfile = async (userId: string, displayName: string, sourceVersion: number) => {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await upsertUserProfile(client, userId, displayName, sourceVersion);
      await client.query("COMMIT");
    } finally {
      client.release();
    }
  };

  it("applies a newer name and ignores a repeat or an older version", async () => {
    const userId = randomUUID();
    await applyProfile(userId, "Elena", 1);
    await applyProfile(userId, "Elena Rostova", 2);
    await applyProfile(userId, "Elena", 1);
    await applyProfile(userId, "Elena Rostova", 2);

    const { rows } = await db.admin.query<{ display_name: string; source_version: number }>(
      "SELECT display_name, source_version FROM family.user_profile WHERE user_id = $1",
      [userId],
    );
    expect(rows).toEqual([{ display_name: "Elena Rostova", source_version: 2 }]);
  });

  it("shows the names of people who share a family, and nobody else", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const stranger = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");
    await applyProfile(admin, "Anna", 1);
    await applyProfile(member, "Ben", 1);
    await applyProfile(stranger, "Cara", 1);

    const outcome = await listFamilyMembers(db.db, member, family.id);

    expect(outcome).toMatchObject({ outcome: "found" });
    const names =
      outcome.outcome === "found" ? outcome.value.members.map((m) => m.displayName) : [];
    expect(names.sort()).toEqual(["Anna", "Ben"]);
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.user_id', $1, true)", [member]);
      const { rows } = await client.query<{ user_id: string }>(
        "SELECT user_id FROM family.user_profile",
      );
      await client.query("COMMIT");
      expect(rows.map((row) => row.user_id).sort()).toEqual([admin, member].sort());
    } finally {
      client.release();
    }
  });
});
