// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { listCalendarView } from "./list-calendar-view.js";

describe("listCalendarView", { timeout: 60_000 }, () => {
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

  const personWithCalendar = async (timeZone?: string): Promise<string> => {
    const userId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [randomUUID(), userId],
    );
    if (timeZone !== undefined) {
      await db.admin.query(
        "INSERT INTO calendar.user_time_zone (user_id, time_zone) VALUES ($1, $2)",
        [userId, timeZone],
      );
    }
    return userId;
  };

  const addEvent = async (userId: string, title: string, startsAt: string, endsAt: string) => {
    await db.admin.query(
      `INSERT INTO calendar.calendar_event (event_id, calendar_id, user_id, title, starts_at, ends_at)
       SELECT $1, calendar_id, user_id, $3, $4, $5 FROM calendar.calendar WHERE user_id = $2`,
      [randomUUID(), userId, title, startsAt, endsAt],
    );
  };

  const titlesByDay = (view: Awaited<ReturnType<typeof listCalendarView>>) =>
    view.days.map((day) => ({ date: day.date, titles: day.events.map((event) => event.title) }));

  it("returns one entry per local date in order, including empty days", async () => {
    const userId = await personWithCalendar();
    await addEvent(userId, "Standup", "2026-11-18T09:00:00Z", "2026-11-18T09:30:00Z");

    const view = await listCalendarView(db.db, userId, { view: "agenda", date: "2026-11-18" });

    expect(view.startDate).toBe("2026-11-18");
    expect(view.endDate).toBe("2026-11-24");
    expect(view.days.map((day) => day.date)).toEqual([
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
      "2026-11-23",
      "2026-11-24",
    ]);
    expect(titlesByDay(view)[0]).toEqual({ date: "2026-11-18", titles: ["Standup"] });
    expect(view.days[1]?.events).toEqual([]);
  });

  it("lists a multi-day event under every day it overlaps and not beyond", async () => {
    const userId = await personWithCalendar();
    await addEvent(userId, "Conference", "2026-11-17T09:00:00Z", "2026-11-19T17:00:00Z");

    const view = await listCalendarView(db.db, userId, { view: "week", date: "2026-11-18" });

    expect(titlesByDay(view)).toEqual([
      { date: "2026-11-16", titles: [] },
      { date: "2026-11-17", titles: ["Conference"] },
      { date: "2026-11-18", titles: ["Conference"] },
      { date: "2026-11-19", titles: ["Conference"] },
      { date: "2026-11-20", titles: [] },
      { date: "2026-11-21", titles: [] },
      { date: "2026-11-22", titles: [] },
    ]);
  });

  it("returns the calendar name and color with each event", async () => {
    const userId = await personWithCalendar();
    await addEvent(userId, "Standup", "2026-11-18T09:00:00Z", "2026-11-18T09:30:00Z");

    const view = await listCalendarView(db.db, userId, { view: "day", date: "2026-11-18" });

    expect(view.days[0]?.events[0]).toMatchObject({ calendarName: "Work", calendarColor: "blue" });
  });

  it("uses UTC when the person has no time zone set", async () => {
    const userId = await personWithCalendar();
    await addEvent(userId, "Late", "2026-11-18T23:30:00Z", "2026-11-18T23:45:00Z");

    const view = await listCalendarView(db.db, userId, { view: "day", date: "2026-11-18" });

    expect(view.days[0]?.events.map((event) => event.title)).toEqual(["Late"]);
  });

  it("uses the person's own time zone for the day boundaries", async () => {
    const userId = await personWithCalendar("Europe/Warsaw");
    await addEvent(userId, "Late", "2026-11-18T23:30:00Z", "2026-11-18T23:45:00Z");

    const onThe18th = await listCalendarView(db.db, userId, { view: "day", date: "2026-11-18" });
    const onThe19th = await listCalendarView(db.db, userId, { view: "day", date: "2026-11-19" });

    expect(onThe18th.days[0]?.events).toEqual([]);
    expect(onThe19th.days[0]?.events.map((event) => event.title)).toEqual(["Late"]);
  });

  it("does not list an event that ends at local midnight starting the range", async () => {
    const userId = await personWithCalendar("Europe/Warsaw");
    await addEvent(userId, "Ends at midnight", "2026-11-17T21:00:00Z", "2026-11-17T23:00:00Z");

    const view = await listCalendarView(db.db, userId, { view: "day", date: "2026-11-18" });

    expect(view.days[0]?.events).toEqual([]);
  });

  it("lists each day once in a Europe/Warsaw week with the 25-hour autumn change", async () => {
    const userId = await personWithCalendar("Europe/Warsaw");
    await addEvent(userId, "Saturday run", "2026-10-24T09:00:00Z", "2026-10-24T10:00:00Z");
    await addEvent(userId, "Sunday brunch", "2026-10-25T10:00:00Z", "2026-10-25T11:00:00Z");

    const view = await listCalendarView(db.db, userId, { view: "week", date: "2026-10-25" });

    expect(view.startDate).toBe("2026-10-19");
    expect(view.endDate).toBe("2026-10-25");
    expect(view.days).toHaveLength(7);
    expect(new Set(view.days.map((day) => day.date)).size).toBe(7);
    expect(view.days.at(-2)?.events.map((event) => event.title)).toEqual(["Saturday run"]);
    expect(view.days.at(-1)?.events.map((event) => event.title)).toEqual(["Sunday brunch"]);
  });

  it("keeps a 25-hour autumn day in America/New_York on one entry", async () => {
    const userId = await personWithCalendar("America/New_York");
    await addEvent(userId, "Late Sunday", "2026-11-02T04:30:00Z", "2026-11-02T05:00:00Z");

    const view = await listCalendarView(db.db, userId, { view: "week", date: "2026-11-01" });

    expect(view.startDate).toBe("2026-10-26");
    expect(view.endDate).toBe("2026-11-01");
    expect(view.days.map((day) => day.date)).toHaveLength(7);
    expect(view.days.at(-1)?.events.map((event) => event.title)).toEqual(["Late Sunday"]);
  });
});
