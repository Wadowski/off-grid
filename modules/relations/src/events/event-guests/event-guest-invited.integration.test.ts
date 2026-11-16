// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startRelationsTestDatabase } from "../../../test/start-relations-test-database.js";
import type { RelationsTestDatabase } from "../../../test/types.js";
import { eventGuestInvitedHandler } from "./event-guest-invited-handler.js";

describe("event guest invitation projection", { timeout: 60_000 }, () => {
  let db: RelationsTestDatabase;
  const hostUserId = randomUUID();
  const guestUserId = randomUUID();
  const eventId = randomUUID();

  beforeAll(async () => {
    db = await startRelationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const invite = (userId: string | null = hostUserId) =>
    eventGuestInvitedHandler(db.db, {
      id: randomUUID(),
      type: "calendar-event-guest-invited-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: null,
      userId,
      sourceVersion: 1,
      payload: { eventId, guestUserId },
    });

  const guestRows = async () => {
    const { rows } = await db.admin.query<{ user_id: string; host_user_id: string }>(
      "SELECT user_id, host_user_id FROM relations.linkable_entity_guest WHERE entity_id = $1",
      [eventId],
    );
    return rows;
  };

  it("records the guest of a host's event", async () => {
    await invite();

    expect(await guestRows()).toEqual([{ user_id: guestUserId, host_user_id: hostUserId }]);
  });

  it("records a repeated invitation once", async () => {
    await invite();
    await invite();

    expect(await guestRows()).toHaveLength(1);
  });

  it("stores an invitation that arrives before the event itself", async () => {
    await invite();
    const { rows } = await db.admin.query(
      "SELECT 1 FROM relations.linkable_entity WHERE entity_id = $1",
      [eventId],
    );

    expect(rows).toHaveLength(0);
    expect(await guestRows()).toHaveLength(1);
  });

  it("refuses an invitation that names no host", async () => {
    await expect(invite(null)).rejects.toThrow("neither a family nor a user owner");
  });
});
