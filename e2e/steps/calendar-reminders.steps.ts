// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationListSchema } from "@offgrid/contracts";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { accountSessionOf, bearer } from "../support/family-sessions.js";
import {
  createCalendarNamed,
  createTimedEvent,
  listEventsOf,
  type CalendarEventsWorld,
  type EventRecord,
} from "../support/factories/calendar-events.js";
import { listCalendars } from "../support/factories/calendar.js";
import {
  freezeClockAt,
  moveEvent,
  releaseClock,
  reminderOffsetsSeenBy,
  setReminderOffsets,
  type CalendarRemindersWorld,
} from "../support/factories/calendar-reminders.js";
import { waitForOwnNotifications } from "../support/factories/notifications.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import {
  instantOfDate,
  MEMBER_READY_INTERVAL_MS,
  MEMBER_READY_TIMEOUT_MS,
  ONE_HOUR_MS,
} from "../support/timing.js";

const { Given, When, Then, After } = createBdd(test);

const ANNA = "Anna";
const FAMILY = "Anna's family";
const FAMILY_CALENDAR = "Family";
const REMINDER_TYPE = "event-reminder";

const eventsOf = (world: ScenarioWorld): CalendarEventsWorld => {
  world.calendarEvents ??= { people: {}, families: {}, members: {}, calendars: [], events: [] };
  return world.calendarEvents;
};

const remindersOf = (world: ScenarioWorld): CalendarRemindersWorld => {
  world.calendarReminders ??= { starts: {}, clockFrozen: false };
  return world.calendarReminders;
};

const sessionOf = async (world: ScenarioWorld, who: string): Promise<Session> => {
  if (who === ANNA) {
    if (world.people?.anna === undefined) {
      throw new Error("Anna is not signed in for this scenario.");
    }
    return world.people.anna.session;
  }
  const scenario = eventsOf(world);
  let session = scenario.people[who];
  if (session === undefined) {
    session = (await accountSessionOf(world.api, who)).session;
    scenario.people[who] = session;
  }
  return session;
};

const eventNamed = (world: ScenarioWorld, title: string): EventRecord => {
  const found = eventsOf(world)
    .events.filter((event) => event.title === title)
    .at(-1);
  if (found === undefined) {
    throw new Error(`No event titled "${title}" was created in this scenario.`);
  }
  return found;
};

const plusHour = (instant: string): string =>
  new Date(Date.parse(instant) + ONE_HOUR_MS).toISOString();

const createPersonalEvent = async (
  world: ScenarioWorld,
  title: string,
  startsAt: string,
): Promise<void> => {
  const anna = await sessionOf(world, ANNA);
  const calendarId = await eventually(
    async () => {
      const defaultCalendar = (await listCalendars(world.api, anna)).find(
        (calendar) => calendar.isDefault,
      );
      if (defaultCalendar === undefined) {
        throw new Error("Anna's default calendar is not ready yet");
      }
      return defaultCalendar.id;
    },
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  const response = await createTimedEvent(world.api, anna, calendarId, {
    title,
    startsAt,
    endsAt: plusHour(startsAt),
  });
  expect(response.status(), `Anna could not create "${title}"`).toBe(201);
  const body = (await response.json()) as { id: string };
  eventsOf(world).events.push({ id: body.id, title, creator: ANNA });
  remindersOf(world).starts[title] = startsAt;
};

const ensureFamily = async (world: ScenarioWorld): Promise<string> => {
  const scenario = eventsOf(world);
  const existing = scenario.families[FAMILY];
  if (existing !== undefined) {
    return existing.id;
  }
  const anna = await sessionOf(world, ANNA);
  const response = await world.api.post("/api/families", {
    headers: bearer(anna),
    data: { name: FAMILY },
    failOnStatusCode: false,
  });
  expect(response.status(), "Anna could not create her family").toBe(201);
  const { id } = (await response.json()) as { id: string };
  scenario.families[FAMILY] = { id };
  scenario.members[FAMILY] = [ANNA];
  return id;
};

const setOffsets = async (
  world: ScenarioWorld,
  who: string,
  title: string,
  offsets: number[],
): Promise<void> => {
  const actor = await sessionOf(world, who);
  const record = eventNamed(world, title);
  const response = await setReminderOffsets(world.api, actor, record.id, offsets);
  expect(response.status(), `${who} could not set reminders on "${title}"`).toBe(200);
};

const freezeAt = async (world: ScenarioWorld, date: string, time: string): Promise<void> => {
  remindersOf(world).clockFrozen = true;
  await freezeClockAt(world.api, instantOfDate(date, time));
};

const countOfType = (items: readonly { type: string }[]): number =>
  items.filter((item) => item.type === REMINDER_TYPE).length;

Given(
  /^Anna has a personal event "([^"]*)" at (\d{2}:\d{2}) UTC on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, title: string, time: string, date: string) => {
    await createPersonalEvent(world, title, instantOfDate(date, time));
  },
);

Given(
  /^Anna has a personal event "([^"]*)" starting in (\d+) minutes$/,
  async ({ world }, title: string, minutes: string) => {
    const startsAt = new Date(Date.now() + Number(minutes) * 60 * 1000).toISOString();
    await createPersonalEvent(world, title, startsAt);
  },
);

Given(
  /^Anna has a family event "([^"]*)" at (\d{2}:\d{2}) UTC on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, title: string, time: string, date: string) => {
    const familyId = await ensureFamily(world);
    const anna = await sessionOf(world, ANNA);
    const reminders = remindersOf(world);
    reminders.familyCalendarId ??= (
      await eventually(
        () => createCalendarNamed(world.api, anna, { name: FAMILY_CALENDAR, familyId }),
        { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
      )
    ).id;
    for (const member of eventsOf(world).members[FAMILY] ?? []) {
      const session = await sessionOf(world, member);
      await eventually(
        async () => {
          const response = await listEventsOf(world.api, session, reminders.familyCalendarId ?? "");
          expect(response.status(), `${member} cannot read the family calendar yet`).toBe(200);
        },
        { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
      );
    }
    const startsAt = instantOfDate(date, time);
    const response = await createTimedEvent(world.api, anna, reminders.familyCalendarId ?? "", {
      title,
      startsAt,
      endsAt: plusHour(startsAt),
    });
    expect(response.status(), `Anna could not create "${title}"`).toBe(201);
    const body = (await response.json()) as { id: string };
    eventsOf(world).events.push({ id: body.id, title, creator: ANNA });
    reminders.starts[title] = startsAt;
  },
);

Given(/^Tom is a member of Anna's family$/, async ({ world }) => {
  const familyId = await ensureFamily(world);
  const admin = await sessionOf(world, ANNA);
  const person = await sessionOf(world, "Tom");
  const invitation = await world.api.post(`/api/families/${familyId}/invitations`, {
    headers: bearer(admin),
    failOnStatusCode: false,
  });
  expect(invitation.status(), "Anna could not invite Tom").toBe(201);
  const { code } = (await invitation.json()) as { code: string };
  const joined = await world.api.post("/api/families/join", {
    headers: bearer(person),
    data: { code },
    failOnStatusCode: false,
  });
  expect(joined.status(), "Tom could not join Anna's family").toBe(201);
  eventsOf(world).members[FAMILY] = [...(eventsOf(world).members[FAMILY] ?? []), "Tom"];
});

Given(
  /^Anna has set a reminder (\d+) minutes before "([^"]*)"$/,
  async ({ world }, minutes: string, title: string) => {
    await setOffsets(world, ANNA, title, [Number(minutes)]);
  },
);

When(
  /^Anna sets a reminder (\d+) minutes before "([^"]*)"$/,
  async ({ world }, minutes: string, title: string) => {
    await setOffsets(world, ANNA, title, [Number(minutes)]);
  },
);

When(
  /^Anna sets reminders (\d+) and (\d+) minutes before "([^"]*)"$/,
  async ({ world }, first: string, second: string, title: string) => {
    await setOffsets(world, ANNA, title, [Number(first), Number(second)]);
  },
);

When(
  /^Anna moves "([^"]*)" to (\d{2}:\d{2}) UTC on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, title: string, time: string, date: string) => {
    const anna = await sessionOf(world, ANNA);
    const record = eventNamed(world, title);
    const startsAt = instantOfDate(date, time);
    const response = await moveEvent(world.api, anna, record.id, {
      startsAt,
      endsAt: plusHour(startsAt),
    });
    expect(response.status(), `Anna could not move "${title}"`).toBe(200);
    remindersOf(world).starts[title] = startsAt;
  },
);

When(
  /^the clock reaches (\d{2}:\d{2}) UTC on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, time: string, date: string) => {
    await freezeAt(world, date, time);
  },
);

When(/^the clock reaches the start of "([^"]*)"$/, async ({ world }, title: string) => {
  const startsAt = remindersOf(world).starts[title];
  if (startsAt === undefined) {
    throw new Error(`No start time is recorded for "${title}" in this scenario.`);
  }
  remindersOf(world).clockFrozen = true;
  await freezeClockAt(world.api, startsAt);
});

Then(
  /^Anna has two inbox items of type "([^"]*)" that name the event "([^"]*)"$/,
  async ({ world }, type: string, title: string) => {
    const anna = await sessionOf(world, ANNA);
    const record = eventNamed(world, title);
    const inbox = await waitForOwnNotifications(
      world.api,
      anna,
      (list) => list.notifications.filter((item) => item.type === type).length >= 2,
    );
    const matching = notificationListSchema
      .parse(inbox.body)
      .notifications.filter((item) => item.type === type);
    expect(countOfType(matching)).toBe(2);
    for (const item of matching) {
      expect(item.data).toEqual({ eventId: record.id });
    }
  },
);

Then(/^Tom has no reminder for the event "([^"]*)"$/, async ({ world }, title: string) => {
  const tom = await sessionOf(world, "Tom");
  const record = eventNamed(world, title);
  const offsets = await reminderOffsetsSeenBy(world.api, tom, record.id);
  expect(offsets).toEqual([]);
});

After(async ({ world }) => {
  if (world.calendarReminders?.clockFrozen === true) {
    await releaseClock(world.api);
  }
});
