// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../test/types.js";

describe("calendar schema isolation", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("shows a family calendar only inside its own family context", async () => {
    const familyId = randomUUID();
    const otherFamilyId = randomUUID();
    const calendarId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.calendar.create({ data: { calendarId, familyId, name: "Kitchen", color: "teal" } });
    });

    const visibleToFamily = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      return tx.calendar.findMany();
    });
    const visibleToOtherFamily = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, otherFamilyId);
      return tx.calendar.findMany();
    });

    expect(visibleToFamily.map((row) => row.calendarId)).toEqual([calendarId]);
    expect(visibleToOtherFamily).toEqual([]);
  });

  it("shows a personal calendar only to its owner", async () => {
    const ownerId = randomUUID();
    const calendarId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      await tx.calendar.create({
        data: { calendarId, userId: ownerId, name: "Work", color: "violet" },
      });
    });

    const visibleToOwner = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      return tx.calendar.findMany();
    });
    const visibleToOther = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, randomUUID());
      return tx.calendar.findMany();
    });

    expect(visibleToOwner.map((row) => row.calendarId)).toEqual([calendarId]);
    expect(visibleToOther).toEqual([]);
  });

  it("shows no calendar when no owner context is set", async () => {
    const familyId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.calendar.create({
        data: { calendarId: randomUUID(), familyId, name: "Kitchen", color: "teal" },
      });
    });

    const rows = await db.db.$transaction((tx) => tx.calendar.findMany());

    expect(rows).toEqual([]);
  });

  it("refuses a calendar that has both a family and a user owner", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, family_id, user_id, name, color) VALUES ($1, $2, $3, 'Both', 'blue')",
        [randomUUID(), randomUUID(), randomUUID()],
      ),
    ).rejects.toThrow(/calendar_one_owner/);
  });
});

describe("calendar event guest isolation", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const host = randomUUID();
  const guest = randomUUID();
  const familyMember = randomUUID();
  const familyId = randomUUID();
  const calendarId = randomUUID();
  const invitedEventId = randomUUID();
  const privateEventId = randomUUID();
  const startsAt = new Date("2026-11-20T10:00:00Z");
  const endsAt = new Date("2026-11-20T11:00:00Z");

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      "INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true), ($1, $3, 1, true), ($1, $4, 1, true)",
      [familyId, host, familyMember, guest],
    );
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      await tx.calendar.create({
        data: { calendarId, userId: host, name: "Work", color: "violet" },
      });
      await tx.calendarEvent.create({
        data: {
          eventId: invitedEventId,
          calendarId,
          userId: host,
          title: "Review",
          startsAt,
          endsAt,
        },
      });
      await tx.calendarEvent.create({
        data: {
          eventId: privateEventId,
          calendarId,
          userId: host,
          title: "Private call",
          startsAt,
          endsAt,
        },
      });
      await tx.eventGuest.create({
        data: { eventId: invitedEventId, guestUserId: guest, userId: host },
      });
    });
  });

  it("shows a guest only the invited event", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendarEvent.findMany();
    });

    expect(visible.map((row) => row.eventId)).toEqual([invitedEventId]);
  });

  it("shows a guest the calendar of the invited event, and nothing else", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendar.findMany();
    });

    expect(visible.map((row) => row.calendarId)).toEqual([calendarId]);
  });

  it("shows a guest only their own guest row", async () => {
    const rows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.eventGuest.findMany();
    });

    expect(rows.map((row) => row.guestUserId)).toEqual([guest]);
  });

  it("denies a guest any update of the invited event", async () => {
    const changed = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendarEvent.updateMany({
        where: { eventId: invitedEventId },
        data: { title: "Changed" },
      });
    });
    const title = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      return tx.calendarEvent.findUniqueOrThrow({ where: { eventId: invitedEventId } });
    });

    expect(changed.count).toBe(0);
    expect(title.title).toBe("Review");
  });

  it("denies a guest any delete of the invited event", async () => {
    const deleted = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendarEvent.deleteMany({ where: { eventId: invitedEventId } });
    });
    const remaining = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      return tx.calendarEvent.count({ where: { eventId: invitedEventId } });
    });

    expect(deleted.count).toBe(0);
    expect(remaining).toBe(1);
  });

  it("refuses a guest insert of an event into the host's calendar", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, guest);
        await tx.calendarEvent.create({
          data: {
            eventId: randomUUID(),
            calendarId,
            userId: guest,
            title: "Sneak",
            startsAt,
            endsAt,
          },
        });
      }),
    ).rejects.toThrow();
  });

  it("refuses a guest who invites themself to an event they cannot see", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, guest);
        await tx.eventGuest.create({
          data: { eventId: privateEventId, guestUserId: guest, userId: guest },
        });
      }),
    ).rejects.toThrow();
  });

  it("refuses a guest who invites a third party to the invited event", async () => {
    const thirdParty = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, guest);
        await tx.eventGuest.create({
          data: { eventId: invitedEventId, guestUserId: thirdParty, userId: guest },
        });
      }),
    ).rejects.toThrow();
    const rows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      return tx.eventGuest.findMany({ where: { eventId: invitedEventId } });
    });

    expect(rows.map((row) => row.guestUserId)).toEqual([guest]);
  });

  it("hides the invited event from a guest who has left the host's family", async () => {
    await db.admin.query(
      "UPDATE calendar.family_membership SET is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyId, guest],
    );

    const events = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendarEvent.findMany();
    });
    const calendars = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.calendar.findMany();
    });
    const guestRows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, guest);
      return tx.eventGuest.findMany();
    });

    expect(events).toEqual([]);
    expect(calendars).toEqual([]);
    expect(guestRows).toEqual([]);
  });

  it("refuses a family member who invites a guest to a personal event they cannot see", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, familyMember);
        await withFamilyContext(tx, familyId);
        await tx.eventGuest.create({
          data: { eventId: privateEventId, guestUserId: familyMember, familyId },
        });
      }),
    ).rejects.toThrow();
    const rows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, familyMember);
      return tx.eventGuest.findMany({ where: { eventId: privateEventId } });
    });

    expect(rows).toEqual([]);
  });
});
