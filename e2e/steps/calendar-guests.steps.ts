// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import {
  calendarEventListSchema,
  calendarEventSchema,
  errorResponseSchema,
  notificationListSchema,
} from "@offgrid/contracts";
import { createBdd } from "playwright-bdd";
import { accountSessionOf } from "../support/family-sessions.js";
import type { Session } from "../support/factories/instance-admin.js";
import {
  listEventsOf,
  readEvent,
  type CalendarEventsWorld,
  type CalendarRecord,
  type EventRecord,
} from "../support/factories/calendar-events.js";
import { createEventWithLocation, inviteGuest } from "../support/factories/calendar-guests.js";
import {
  listOwnNotifications,
  waitForOwnNotifications,
} from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

type Person = { session: Session };

const createdEventSchema = calendarEventSchema.pick({ id: true });

const state = (world: ScenarioWorld): CalendarEventsWorld => {
  world.calendarEvents ??= { people: {}, families: {}, members: {}, calendars: [], events: [] };
  return world.calendarEvents;
};

const sessionFor = async (world: ScenarioWorld, name: string): Promise<Person> => {
  const scenario = state(world);
  let session = scenario.people[name];
  if (session === undefined) {
    session =
      name === "Anna" && world.people?.anna !== undefined
        ? world.people.anna.session
        : (await accountSessionOf(world.api, name)).session;
    scenario.people[name] = session;
  }
  return { session };
};

const calendarNamed = (world: ScenarioWorld, name: string): CalendarRecord => {
  const scenario = state(world);
  const matches = scenario.calendars.filter((calendar) => calendar.name === name);
  const found = matches.find((calendar) => calendar.owner === scenario.actor) ?? matches[0];
  if (found === undefined) {
    throw new Error(`No calendar named "${name}" is set up in this scenario.`);
  }
  return found;
};

const eventNamed = (world: ScenarioWorld, title: string): EventRecord => {
  const found = state(world)
    .events.filter((event) => event.title === title)
    .at(-1);
  if (found === undefined) {
    throw new Error(`No event titled "${title}" was created in this scenario.`);
  }
  return found;
};

const instant = (text: string): string => `${text.replace(" ", "T")}:00Z`;

const endInstant = (start: string, endDate: string | undefined, endTime: string): string =>
  instant(`${endDate ?? start.slice(0, 10)} ${endTime}`);

const sameInstant = (actual: string, expected: string): void => {
  expect(new Date(actual).toISOString()).toBe(new Date(expected).toISOString());
};

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  const body: unknown = await response.json().catch(() => undefined);
  world.response = { status: response.status(), body };
};

const errorCodeOf = (world: ScenarioWorld): string =>
  errorResponseSchema.parse(world.response?.body).code;

const eventTitlesOf = (world: ScenarioWorld): string[] =>
  calendarEventListSchema.parse(world.response?.body).events.map((event) => event.title);

const instantOfDate = (date: string, time: string): string => instant(`${date} ${time}`);

const createEventFor = async (
  world: ScenarioWorld,
  creatorName: string,
  calendarName: string,
  title: string,
  start: string,
  endDate: string | undefined,
  endTime: string,
  location: string | undefined,
): Promise<void> => {
  const creator = await sessionFor(world, creatorName);
  const calendar = calendarNamed(world, calendarName);
  const response = await createEventWithLocation(world.api, creator.session, calendar.id, {
    title,
    startsAt: instant(start),
    endsAt: endInstant(start, endDate, endTime),
    location,
  });
  expect(response.status(), `${creatorName} could not create "${title}"`).toBe(201);
  const created = createdEventSchema.parse(await response.json());
  state(world).events.push({ id: created.id, title, creator: creatorName });
};

const INVITE_SETTLE_TIMEOUT_MS = 5_000;
const INVITE_SETTLE_INTERVAL_MS = 200;

const inviteSettled = async (
  api: APIRequestContext,
  session: Session,
  eventId: string,
  guestUserId: string,
): Promise<APIResponse> => {
  const deadline = Date.now() + INVITE_SETTLE_TIMEOUT_MS;
  let response = await inviteGuest(api, session, eventId, guestUserId);
  while (response.status() === 400 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, INVITE_SETTLE_INTERVAL_MS));
    response = await inviteGuest(api, session, eventId, guestUserId);
  }
  return response;
};

const inviteAndRecord = async (
  world: ScenarioWorld,
  hostName: string,
  guestName: string,
  title: string,
): Promise<void> => {
  const host = await sessionFor(world, hostName);
  const guest = await sessionFor(world, guestName);
  const record = eventNamed(world, title);
  const response = await inviteSettled(world.api, host.session, record.id, guest.session.userId);
  await recordResponse(world, response);
};

Given(
  /^(\w+) has an event "([^"]*)" in "([^"]*)" from (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (?:(\d{4}-\d{2}-\d{2}) )?(\d{2}:\d{2}) in UTC at "([^"]*)"$/,
  async (
    { world },
    creatorName: string,
    title: string,
    calendarName: string,
    start: string,
    endDate: string | undefined,
    endTime: string,
    location: string,
  ) => {
    await createEventFor(
      world,
      creatorName,
      calendarName,
      title,
      start,
      endDate,
      endTime,
      location,
    );
  },
);

Given(
  /^the family "([^"]*)" has an event "([^"]*)" in "([^"]*)" from (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (?:(\d{4}-\d{2}-\d{2}) )?(\d{2}:\d{2}) in UTC$/,
  async (
    { world },
    family: string,
    title: string,
    calendarName: string,
    start: string,
    endDate: string | undefined,
    endTime: string,
  ) => {
    await createEventFor(
      world,
      `${family} admin`,
      calendarName,
      title,
      start,
      endDate,
      endTime,
      undefined,
    );
  },
);

Given(
  /^(\w+) has invited (\w+) to the event "([^"]*)"$/,
  async ({ world }, hostName: string, guestName: string, title: string) => {
    await inviteAndRecord(world, hostName, guestName, title);
    const response = world.response;
    expect(response?.status, `${hostName} could not invite ${guestName}`).toBe(201);
  },
);

Given(/^(\w+) has an account in no family shared with \w+$/, async ({ world }, name: string) => {
  await sessionFor(world, name);
});

When(
  /^(\w+) invites (\w+) to the event "([^"]*)"(?: again)?$/,
  async ({ world }, hostName: string, guestName: string, title: string) => {
    await inviteAndRecord(world, hostName, guestName, title);
  },
);

When(
  /^(\w+) lists the events of the calendar "([^"]*)"$/,
  async ({ world }, who: string, calendarName: string) => {
    const actor = await sessionFor(world, who);
    const calendar = calendarNamed(world, calendarName);
    const response = await listEventsOf(world.api, actor.session, calendar.id);
    await recordResponse(world, response);
  },
);

// A guest write is answered as forbidden, with the stable error code.
Then("Ben is told the change is not allowed", ({ world }) => {
  expect(world.response?.status).toBe(403);
  expect(errorCodeOf(world)).toBe("FORBIDDEN");
});

// An invite to an event the host cannot see is answered as not found.
Then(/^\w+ is told the event is not found$/, ({ world }) => {
  expect(world.response?.status).toBe(404);
});

// A refused invite is answered as a validation failure, with one fixed message.
Then("the invite is refused", ({ world }) => {
  expect(world.response?.status).toBe(400);
  expect(errorCodeOf(world)).toBe("VALIDATION_FAILED");
});

Then(/^(\w+) cannot see the event "([^"]*)"$/, ({ world }, _who: string, title: string) => {
  expect(world.response?.status, `"${title}" is visible`).toBe(404);
});

Then(
  /^(\w+) can read the event "([^"]*)" from (\d{2}:\d{2}) to (\d{2}:\d{2}) UTC on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, who: string, title: string, start: string, end: string, date: string) => {
    const guest = await sessionFor(world, who);
    const record = eventNamed(world, title);
    const response = await readEvent(world.api, guest.session, record.id);
    expect(response.status(), `${who} cannot read "${title}"`).toBe(200);
    const body = calendarEventSchema.parse(await response.json());
    expect(body.title).toBe(title);
    sameInstant(body.startsAt, instantOfDate(date, start));
    sameInstant(body.endsAt, instantOfDate(date, end));
  },
);

Then(
  /^the event "([^"]*)" is read-only for (\w+)$/,
  async ({ world }, title: string, who: string) => {
    const guest = await sessionFor(world, who);
    const record = eventNamed(world, title);
    const response = await readEvent(world.api, guest.session, record.id);
    expect(response.status()).toBe(200);
    const body = calendarEventSchema.parse(await response.json());
    expect(body.readOnly).toBe(true);
  },
);

Then(
  /^the event "([^"]*)" shows the location "([^"]*)" and the calendar name "([^"]*)" to (\w+)$/,
  async ({ world }, title: string, location: string, calendarName: string, who: string) => {
    const guest = await sessionFor(world, who);
    const record = eventNamed(world, title);
    const response = await readEvent(world.api, guest.session, record.id);
    expect(response.status()).toBe(200);
    const body = calendarEventSchema.parse(await response.json());
    expect(body.location).toBe(location);
    expect(body.calendarName).toBe(calendarName);
  },
);

Then(
  /^the event "([^"]*)" is still stored with the title "([^"]*)"$/,
  async ({ world }, title: string, expectedTitle: string) => {
    const record = eventNamed(world, title);
    const creator = await sessionFor(world, record.creator);
    const response = await readEvent(world.api, creator.session, record.id);
    expect(response.status(), `"${title}" is no longer stored`).toBe(200);
    const body = calendarEventSchema.parse(await response.json());
    expect(body.title).toBe(expectedTitle);
  },
);

Then(
  /^the list (does not contain|contains) the event "([^"]*)"$/,
  ({ world }, expectation: string, title: string) => {
    expect(world.response?.status).toBe(200);
    const titles = eventTitlesOf(world);
    if (expectation === "contains") {
      expect(titles).toContain(title);
    } else {
      expect(titles).not.toContain(title);
    }
  },
);

Then(
  /^(\w+) has one inbox item of type "([^"]*)" that names the event "([^"]*)"$/,
  async ({ world }, who: string, type: string, title: string) => {
    const guest = await sessionFor(world, who);
    const record = eventNamed(world, title);
    const inbox = await waitForOwnNotifications(world.api, guest.session, (list) =>
      list.notifications.some((item) => item.type === type),
    );
    const matching = notificationListSchema
      .parse(inbox.body)
      .notifications.filter((item) => item.type === type);
    expect(matching).toHaveLength(1);
    expect(matching[0]?.data).toEqual({ eventId: record.id });
  },
);

Then(
  /^(\w+) has no inbox item of type "([^"]*)"$/,
  async ({ world }, who: string, type: string) => {
    const person = await sessionFor(world, who);
    const inbox = await listOwnNotifications(world.api, person.session);
    expect(inbox.status).toBe(200);
    expect(inbox.body.notifications.map((item) => item.type)).not.toContain(type);
  },
);
