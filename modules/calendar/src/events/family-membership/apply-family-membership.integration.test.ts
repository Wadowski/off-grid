// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withTransaction } from "@offgrid/event-bus";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "./apply-family-membership.js";

describe("family membership projection", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const familyId = randomUUID();
  const userId = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const apply = (sourceVersion: number, isMember: boolean) =>
    withTransaction(db.pool, (client) =>
      applyFamilyMembership(client, { familyId, userId, sourceVersion, isMember }),
    );

  const stored = async () => {
    const { rows } = await db.admin.query<{ source_version: number; is_member: boolean }>(
      "SELECT source_version, is_member FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
      [familyId, userId],
    );
    return rows[0];
  };

  it("makes a person a member when the join is applied", async () => {
    await apply(1, true);

    expect(await stored()).toEqual({ source_version: 1, is_member: true });
  });

  it("keeps the removal as a row, so a late join cannot bring the person back", async () => {
    await apply(1, true);
    await apply(2, false);
    await apply(1, true);

    expect(await stored()).toEqual({ source_version: 2, is_member: false });
  });

  it("ignores a change that was already applied", async () => {
    await apply(1, true);
    await apply(1, true);

    expect(await stored()).toEqual({ source_version: 1, is_member: true });
  });

  it("denies a person whose earlier change was made before the projection existed", async () => {
    await apply(3, true);

    expect(await stored()).toEqual({ source_version: 3, is_member: false });
  });

  it("refuses a change that arrives before an earlier change it depends on", async () => {
    await apply(1, true);

    await expect(apply(3, true)).rejects.toThrow("arrived before an earlier change");
    expect(await stored()).toEqual({ source_version: 1, is_member: true });
  });
});
