// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { applyAccountName } from "./apply-account-name.js";

describe("applyAccountName", { timeout: 60_000 }, () => {
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

  const apply = async (userId: string, displayName: string, sourceVersion: number) => {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await applyAccountName(client, { userId, displayName, sourceVersion });
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const storedName = async (userId: string) => {
    const { rows } = await db.admin.query<{ display_name: string; source_version: number }>(
      "SELECT display_name, source_version FROM family.account_name WHERE user_id = $1",
      [userId],
    );
    return rows[0] ?? null;
  };

  it("stores the first name of an account", async () => {
    const userId = randomUUID();

    await apply(userId, "Sam Smith", 1);

    expect(await storedName(userId)).toEqual({ display_name: "Sam Smith", source_version: 1 });
  });

  it("applies a later name change", async () => {
    const userId = randomUUID();
    await apply(userId, "Sam Smith", 1);

    await apply(userId, "Sam Jones", 2);

    expect(await storedName(userId)).toEqual({ display_name: "Sam Jones", source_version: 2 });
  });

  it("ignores a change older than the stored one", async () => {
    const userId = randomUUID();
    await apply(userId, "Sam Smith", 1);
    await apply(userId, "Sam Jones", 2);

    await apply(userId, "Sam Smith", 1);

    expect(await storedName(userId)).toEqual({ display_name: "Sam Jones", source_version: 2 });
  });

  it("ignores a repeat of the stored change", async () => {
    const userId = randomUUID();
    await apply(userId, "Sam Smith", 1);

    await apply(userId, "Sam Smith", 1);

    expect(await storedName(userId)).toEqual({ display_name: "Sam Smith", source_version: 1 });
  });

  it("refuses a change that skips a version and writes nothing", async () => {
    const userId = randomUUID();
    await apply(userId, "Sam Smith", 1);

    await expect(apply(userId, "Sam Jones", 3)).rejects.toThrow(
      "account name change arrived before an earlier change",
    );
    expect(await storedName(userId)).toEqual({ display_name: "Sam Smith", source_version: 1 });
  });
});
