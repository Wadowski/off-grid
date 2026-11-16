// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startRelationsTestDatabase } from "../../../test/start-relations-test-database.js";
import type { RelationsTestDatabase } from "../../../test/types.js";
import { calendarEventProjectionHandler } from "./calendar-event-projection-handler.js";

const payloadOf = (eventId: string, calendarId: string, title: string) => ({
  eventId,
  calendarId,
  title,
  location: null,
  description: null,
  startsAt: "2026-11-20T10:00:00.000Z",
  endsAt: "2026-11-20T11:00:00.000Z",
  isAllDay: false,
  version: 1,
});

describe("calendar event projection", { timeout: 60_000 }, () => {
  let db: RelationsTestDatabase;
  const familyId = randomUUID();
  const userId = randomUUID();
  const eventId = randomUUID();
  const calendarId = randomUUID();

  beforeAll(async () => {
    db = await startRelationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const created = (sourceVersion: number, title: string, owner = { familyId, userId: null }) =>
    ({
      id: randomUUID(),
      type: "calendar-event-created-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: owner.familyId,
      userId: owner.userId,
      sourceVersion,
      payload: payloadOf(eventId, calendarId, title),
    }) as Parameters<typeof calendarEventProjectionHandler>[1];

  const updated = (sourceVersion: number, title: string, owner = { familyId, userId: null }) =>
    ({
      ...created(sourceVersion, title, owner),
      type: "calendar-event-updated-v1",
    }) as Parameters<typeof calendarEventProjectionHandler>[1];

  const removed = (sourceVersion: number, owner = { familyId, userId: null }) =>
    ({
      id: randomUUID(),
      type: "calendar-event-removed-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: owner.familyId,
      userId: owner.userId,
      sourceVersion,
      payload: { eventId, calendarId },
    }) as Parameters<typeof calendarEventProjectionHandler>[1];

  const apply = (event: Parameters<typeof calendarEventProjectionHandler>[1]) =>
    calendarEventProjectionHandler(db.db, event);

  const stored = async () => {
    const { rows } = await db.admin.query<{
      title: string;
      source_version: number;
      is_removed: boolean;
    }>(
      "SELECT title, source_version, is_removed FROM relations.linkable_entity WHERE entity_id = $1",
      [eventId],
    );
    return rows[0];
  };

  it("shows a created event with its title and owner", async () => {
    await apply(created(1, "Dentist"));

    expect(await stored()).toEqual({ title: "Dentist", source_version: 1, is_removed: false });
  });

  it("applies an update to the title", async () => {
    await apply(created(1, "Dentist"));
    await apply(updated(2, "Orthodontist"));

    expect(await stored()).toEqual({ title: "Orthodontist", source_version: 2, is_removed: false });
  });

  it("ignores the same event delivered twice", async () => {
    await apply(created(1, "Dentist"));
    await apply(created(1, "Dentist"));

    expect(await stored()).toEqual({ title: "Dentist", source_version: 1, is_removed: false });
  });

  it("does not let a late update regress the title", async () => {
    await apply(created(1, "Dentist"));
    await apply(updated(2, "Orthodontist"));
    await apply(updated(3, "Orthodontist v2"));
    await apply(updated(2, "Dentist"));

    expect(await stored()).toEqual({
      title: "Orthodontist v2",
      source_version: 3,
      is_removed: false,
    });
  });

  it("ignores a create that arrives after a later update", async () => {
    await apply(created(1, "Dentist"));
    await apply(updated(2, "Orthodontist"));
    await apply(created(1, "Dentist"));

    expect(await stored()).toEqual({ title: "Orthodontist", source_version: 2, is_removed: false });
  });

  it("refuses an update that arrives before an earlier change", async () => {
    await apply(created(1, "Dentist"));

    await expect(apply(updated(3, "Orthodontist"))).rejects.toThrow(
      "arrived before an earlier change",
    );
    expect(await stored()).toEqual({ title: "Dentist", source_version: 1, is_removed: false });
  });

  it("drops a removed event and keeps a tombstone that a late update cannot undo", async () => {
    await apply(created(1, "Dentist"));
    await apply(removed(2));
    await apply(updated(2, "Dentist"));

    expect(await stored()).toEqual({ title: "Dentist", source_version: 2, is_removed: true });
  });

  it("does not bring back a removed event on a replayed create", async () => {
    await apply(created(1, "Dentist"));
    await apply(removed(2));
    await apply(created(1, "Dentist"));

    expect(await stored()).toEqual({ title: "Dentist", source_version: 2, is_removed: true });
  });

  it("removes the guest rows of an event that is removed", async () => {
    await apply(created(1, "Dentist", { familyId: null as unknown as string, userId }));
    await db.admin.query(
      `INSERT INTO relations.linkable_entity_guest (entity_type, entity_id, user_id, host_user_id)
       VALUES ('calendar-event', $1, $2, $3)`,
      [eventId, randomUUID(), userId],
    );
    await apply(removed(2, { familyId: null as unknown as string, userId }));
    const { rows } = await db.admin.query(
      "SELECT 1 FROM relations.linkable_entity_guest WHERE entity_id = $1",
      [eventId],
    );

    expect(rows).toHaveLength(0);
  });

  it("rebuilds the same projection when the events are replayed from the start", async () => {
    const replay = [created(1, "Dentist"), updated(2, "Orthodontist"), removed(3)];
    for (const event of replay) {
      await apply(event);
    }
    const afterFirstPass = await stored();
    for (const event of replay) {
      await apply(event);
    }

    expect(await stored()).toEqual(afterFirstPass);
    expect(afterFirstPass).toEqual({ title: "Orthodontist", source_version: 3, is_removed: true });
  });

  it("records a personal event under its owning user", async () => {
    await apply(created(1, "Private", { familyId: null as unknown as string, userId }));
    const { rows } = await db.admin.query<{ user_id: string; family_id: string | null }>(
      "SELECT user_id, family_id FROM relations.linkable_entity WHERE entity_id = $1",
      [eventId],
    );

    expect(rows[0]).toEqual({ user_id: userId, family_id: null });
  });
});
