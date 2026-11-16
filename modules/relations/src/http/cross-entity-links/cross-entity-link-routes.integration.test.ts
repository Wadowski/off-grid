// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startRelationsTestDatabase } from "../../../test/start-relations-test-database.js";
import type { Actor, RelationsTestDatabase } from "../../../test/types.js";
import { calendarEventProjectionHandler } from "../../events/calendar-events/calendar-event-projection-handler.js";
import { eventGuestInvitedHandler } from "../../events/event-guests/event-guest-invited-handler.js";
import { registerRelationsRoutes } from "../register-relations-routes.js";

describe("cross-entity link routes", { timeout: 60_000 }, () => {
  let db: RelationsTestDatabase;
  let app: FastifyInstance;
  const home = randomUUID();
  const other = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const cara = randomUUID();
  const dentist = randomUUID();
  const planWeek = randomUUID();
  const annaPrivate = randomUUID();
  const carasEvent = randomUUID();
  const calendarId = randomUUID();

  beforeAll(async () => {
    db = await startRelationsTestDatabase();
    app = Fastify();
    await app.register(async (api) =>
      registerRelationsRoutes(api, {
        db: db.db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
        currentFamilyId: (request) => request.headers["x-family-id"]?.toString() ?? null,
      }),
    );
    await app.ready();
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      `INSERT INTO relations.family_member (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($1, $3, 1, true), ($4, $5, 1, true)`,
      [home, anna, ben, other, cara],
    );
    await db.admin.query(
      `INSERT INTO relations.linkable_entity (entity_type, entity_id, family_id, user_id, title, source_version) VALUES
         ('calendar-event', $1, $2, NULL, 'Dentist', 1),
         ('calendar-event', $3, $2, NULL, 'Plan week', 1),
         ('calendar-event', $4, NULL, $5, 'Anna private', 1),
         ('calendar-event', $6, $7, NULL, 'Cara event', 1)`,
      [dentist, home, planWeek, annaPrivate, anna, carasEvent, other],
    );
  });

  const send = (method: "GET" | "POST" | "DELETE", url: string, actor: Actor, payload?: unknown) =>
    app.inject({
      method,
      url,
      payload: payload as Record<string, unknown> | undefined,
      headers: {
        "x-user-id": actor.userId,
        ...(actor.familyId ? { "x-family-id": actor.familyId } : {}),
      },
    });

  const link = (sourceId: string, targetId: string, actor: Actor) =>
    send("POST", "/links", actor, {
      sourceType: "calendar-event",
      sourceId,
      targetType: "calendar-event",
      targetId,
    });

  const listOf = async (entityId: string, actor: Actor) => {
    const response = await send(
      "GET",
      `/links?entityType=calendar-event&entityId=${entityId}`,
      actor,
    );
    return response.json<{ links: Array<{ id: string; title: string }> }>().links;
  };

  it("creates a link between two family events and lists the other end's title", async () => {
    const created = await link(planWeek, dentist, { userId: anna, familyId: home });

    expect(created.statusCode).toBe(201);
    const links = await listOf(planWeek, { userId: anna, familyId: home });
    expect(links).toEqual([expect.objectContaining({ id: created.json().id, title: "Dentist" })]);
  });

  it("returns the existing link when the same pair is linked again", async () => {
    const first = await link(planWeek, dentist, { userId: anna, familyId: home });
    const again = await link(planWeek, dentist, { userId: anna, familyId: home });

    expect(again.statusCode).toBe(200);
    expect(again.json().id).toBe(first.json().id);
  });

  it("refuses a link from an event to itself", async () => {
    const response = await link(dentist, dentist, { userId: anna, familyId: home });

    expect(response.statusCode).toBe(422);
  });

  it("does not reveal an event another family cannot see", async () => {
    const response = await link(carasEvent, dentist, { userId: ben, familyId: home });

    expect(response.statusCode).toBe(404);
  });

  it("does not let a family member link to another person's private event", async () => {
    const response = await link(planWeek, annaPrivate, { userId: ben, familyId: home });

    expect(response.statusCode).toBe(404);
  });

  it("shows the new title after the event is renamed, without writing the link", async () => {
    const created = await link(planWeek, dentist, { userId: anna, familyId: home });
    await calendarEventProjectionHandler(db.db, {
      id: randomUUID(),
      type: "calendar-event-updated-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: home,
      userId: null,
      sourceVersion: 2,
      payload: {
        eventId: dentist,
        calendarId,
        title: "Orthodontist",
        location: null,
        description: null,
        startsAt: "2026-11-20T10:00:00.000Z",
        endsAt: "2026-11-20T11:00:00.000Z",
        isAllDay: false,
        version: 2,
      },
    } as Parameters<typeof calendarEventProjectionHandler>[1]);

    const links = await listOf(planWeek, { userId: anna, familyId: home });
    expect(links).toEqual([
      expect.objectContaining({ id: created.json().id, title: "Orthodontist" }),
    ]);
  });

  it("drops a link when the other event is removed, and refuses to link to it again", async () => {
    await link(planWeek, dentist, { userId: anna, familyId: home });
    await calendarEventProjectionHandler(db.db, {
      id: randomUUID(),
      type: "calendar-event-removed-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: home,
      userId: null,
      sourceVersion: 2,
      payload: { eventId: dentist, calendarId },
    } as Parameters<typeof calendarEventProjectionHandler>[1]);

    expect(await listOf(planWeek, { userId: anna, familyId: home })).toEqual([]);
    expect((await link(planWeek, dentist, { userId: anna, familyId: home })).statusCode).toBe(404);
  });

  it("removes a link and refuses to remove it twice", async () => {
    const created = await link(planWeek, dentist, { userId: anna, familyId: home });
    const url = `/links/${created.json().id}`;

    expect((await send("DELETE", url, { userId: anna, familyId: home })).statusCode).toBe(204);
    expect((await send("DELETE", url, { userId: anna, familyId: home })).statusCode).toBe(404);
    expect(await listOf(planWeek, { userId: anna, familyId: home })).toEqual([]);
  });

  it("lets a guest link to an event they were invited to, and drops it once they leave the family", async () => {
    await eventGuestInvitedHandler(db.db, {
      id: randomUUID(),
      type: "calendar-event-guest-invited-v1",
      version: 1,
      occurredAt: "2026-11-20T09:00:00.000Z",
      traceId: "trace-under-test",
      familyId: null,
      userId: anna,
      sourceVersion: 1,
      payload: { eventId: annaPrivate, guestUserId: ben },
    } as Parameters<typeof eventGuestInvitedHandler>[1]);
    const benNotes = randomUUID();
    await db.admin.query(
      `INSERT INTO relations.linkable_entity (entity_type, entity_id, family_id, user_id, title, source_version)
       VALUES ('calendar-event', $1, NULL, $2, 'Notes', 1)`,
      [benNotes, ben],
    );

    const created = await link(benNotes, annaPrivate, { userId: ben });
    expect(created.statusCode).toBe(201);
    expect(await listOf(benNotes, { userId: ben })).toEqual([
      expect.objectContaining({ title: "Anna private" }),
    ]);

    await db.admin.query(
      "UPDATE relations.family_member SET is_member = false, source_version = 2 WHERE family_id = $1 AND user_id = $2",
      [home, ben],
    );
    expect(await listOf(benNotes, { userId: ben })).toEqual([]);
  });
});
