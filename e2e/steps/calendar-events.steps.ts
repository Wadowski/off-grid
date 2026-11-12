// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { accountSessionOf, bearer } from "../support/family-sessions.js";
import {
  changeEvent,
  createAllDayEvent,
  createCalendarNamed,
  createTimedEvent,
  deleteEvent,
  eventBodyOf,
  listEventsOf,
  readEvent,
  setTimeZoneFor,
  type CalendarEventsWorld,
  type CalendarRecord,
  type EventBody,
  type EventRecord,
} from "../support/factories/calendar-events.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const PRONOUNS = ["she", "he"];
const DEFAULT_START = "2026-11-20 10:00";
const DEFAULT_END = "2026-11-20 11:00";
const REFUSED_STATUSES = [400, 409];
const NOT_FOUND = 404;
const MEMBER_READY_TIMEOUT_MS = 10_000;
const MEMBER_READY_INTERVAL_MS = 200;

const state = (world: ScenarioWorld): CalendarEventsWorld => {
  world.calendarEvents ??= { people: {}, families: {}, members: {}, calendars: [], events: [] };
  return world.calendarEvents;
};

const adminOf = (family: string): string => `${family} admin`;

const ownerOf = (calendar: CalendarRecord): string =>
  calendar.owner ?? adminOf(calendar.familyName ?? "");

const instant = (text: string): string => `${text.replace(" ", "T")}:00Z`;

const endInstant = (start: string, endDate: string | null | undefined, endTime: string): string =>
  instant(`${endDate ?? start.slice(0, 10)} ${endTime}`);

const personNamed = async (
  world: ScenarioWorld,
  who: string,
): Promise<{ name: string; session: { userId: string; accessToken: string } }> => {
  const scenario = state(world);
  const name = PRONOUNS.includes(who) ? (scenario.actor ?? "Anna") : who;
  let session = scenario.people[name];
  if (session === undefined) {
    session =
      name === "Anna" && world.people?.anna !== undefined
        ? world.people.anna.session
        : (await accountSessionOf(world.api, name)).session;
    scenario.people[name] = session;
  }
  return { name, session };
};

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<unknown> => {
  const body: unknown = await response.json().catch(() => undefined);
  world.response = { status: response.status(), body };
  return body;
};

const ensureFamily = async (world: ScenarioWorld, family: string): Promise<void> => {
  const scenario = state(world);
  if (scenario.families[family] !== undefined) {
    return;
  }
  const admin = await personNamed(world, adminOf(family));
  const response = await world.api.post("/api/families", {
    headers: bearer(admin.session),
    data: { name: family },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create the family "${family}"`).toBe(201);
  const created = (await response.json()) as { id: string };
  scenario.families[family] = { id: created.id };
  scenario.members[family] = [admin.name];
};

const joinFamily = async (world: ScenarioWorld, who: string, family: string): Promise<void> => {
  await ensureFamily(world, family);
  const scenario = state(world);
  const person = await personNamed(world, who);
  if (scenario.members[family]?.includes(person.name)) {
    return;
  }
  const admin = await personNamed(world, adminOf(family));
  const invitation = await world.api.post(
    `/api/families/${scenario.families[family]?.id ?? ""}/invitations`,
    { headers: bearer(admin.session), failOnStatusCode: false },
  );
  expect(invitation.status(), `could not invite ${person.name}`).toBe(201);
  const { code } = (await invitation.json()) as { code: string };
  const joined = await world.api.post("/api/families/join", {
    headers: bearer(person.session),
    data: { code },
    failOnStatusCode: false,
  });
  expect(joined.status(), `${person.name} could not join "${family}"`).toBe(201);
  scenario.members[family] = [...(scenario.members[family] ?? []), person.name];
};

const waitUntilMembersCanRead = async (
  world: ScenarioWorld,
  family: string,
  calendarId: string,
): Promise<void> => {
  for (const memberName of state(world).members[family] ?? []) {
    const member = await personNamed(world, memberName);
    await eventually(
      async () => {
        const response = await listEventsOf(world.api, member.session, calendarId);
        expect(response.status(), `${memberName} cannot read the calendar yet`).toBe(200);
      },
      { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
    );
  }
};

const createFamilyCalendar = async (
  world: ScenarioWorld,
  family: string,
  name: string,
): Promise<void> => {
  await ensureFamily(world, family);
  const scenario = state(world);
  const admin = await personNamed(world, adminOf(family));
  const { id } = await eventually(
    () =>
      createCalendarNamed(world.api, admin.session, {
        name,
        familyId: scenario.families[family]?.id,
      }),
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  scenario.calendars.push({ name, id, familyName: family });
  await waitUntilMembersCanRead(world, family, id);
};

const createPersonalCalendar = async (
  world: ScenarioWorld,
  who: string,
  name: string,
): Promise<void> => {
  const person = await personNamed(world, who);
  const { id } = await createCalendarNamed(world.api, person.session, { name });
  state(world).calendars.push({ name, id, owner: person.name });
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

const fetchEvent = async (world: ScenarioWorld, title: string): Promise<EventBody> => {
  const record = eventNamed(world, title);
  const creator = await personNamed(world, record.creator);
  const response = await readEvent(world.api, creator.session, record.id);
  expect(response.status(), `event "${title}" cannot be read`).toBe(200);
  return eventBodyOf(response);
};

const titlesSeenBy = async (
  world: ScenarioWorld,
  who: string,
  calendarName: string,
): Promise<string[]> => {
  const person = await personNamed(world, who);
  const calendar = calendarNamed(world, calendarName);
  const response = await listEventsOf(world.api, person.session, calendar.id);
  expect(response.status(), `${who} cannot list "${calendarName}"`).toBe(200);
  const body = (await response.json()) as { events: { title: string }[] };
  return body.events.map((event) => event.title);
};

const titlesInEveryCalendar = async (world: ScenarioWorld): Promise<string[]> => {
  const titles: string[] = [];
  for (const calendar of state(world).calendars) {
    const owner = await personNamed(world, ownerOf(calendar));
    const response = await listEventsOf(world.api, owner.session, calendar.id);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { events: { title: string }[] };
    titles.push(...body.events.map((event) => event.title));
  }
  return titles;
};

const rememberCreated = (
  world: ScenarioWorld,
  body: unknown,
  status: number,
  title: string,
  creator: string,
): void => {
  if (status !== 201) {
    return;
  }
  const created = body as EventBody;
  state(world).events.push({ id: created.id, title, creator });
};

const sameInstant = (actual: string, expected: string): void => {
  expect(new Date(actual).toISOString()).toBe(new Date(expected).toISOString());
};

Given(/^(Ben|Carol) is signed in$/, async ({ world }, who: string) => {
  const person = await personNamed(world, who);
  state(world).actor = person.name;
});

Given(/^her time zone is "([^"]*)"$/, async ({ world }, timeZone: string) => {
  const person = await personNamed(world, "she");
  const response = await setTimeZoneFor(world.api, person.session, timeZone);
  expect(response.status(), `could not set the time zone to ${timeZone}`).toBe(200);
});

Given(
  /^(\w+) has a personal calendar named "([^"]*)"$/,
  async ({ world }, who: string, name: string) => {
    await createPersonalCalendar(world, who, name);
  },
);

Given(
  /^the family "([^"]*)" has a calendar named "([^"]*)"$/,
  async ({ world }, family: string, name: string) => {
    await createFamilyCalendar(world, family, name);
  },
);

Given(
  /^(\w+) and (\w+) are both members of the family "([^"]*)"$/,
  async ({ world }, first: string, second: string, family: string) => {
    await joinFamily(world, first, family);
    await joinFamily(world, second, family);
  },
);

Given(
  /^(\w+) is a member of the family "([^"]*)"$/,
  async ({ world }, who: string, family: string) => {
    await joinFamily(world, who, family);
  },
);

Given(
  /^(\w+) does not belong to the family "([^"]*)"$/,
  async ({ world }, who: string, family: string) => {
    await ensureFamily(world, family);
    const person = await personNamed(world, who);
    const response = await world.api.get("/api/families", {
      headers: bearer(person.session),
      failOnStatusCode: false,
    });
    const body = (await response.json()) as { families: { name: string }[] };
    expect(body.families.map((item) => item.name)).not.toContain(family);
  },
);

Given(
  /^(\w+) has an event "([^"]*)" in "([^"]*)"(?: from (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (?:(\d{4}-\d{2}-\d{2}) )?(\d{2}:\d{2}) in UTC)?$/,
  async (
    { world },
    who: string,
    title: string,
    calendarName: string,
    startText: string | null | undefined,
    endDate: string | null | undefined,
    endTime: string | null | undefined,
  ) => {
    const creator = await personNamed(world, who);
    const calendar = calendarNamed(world, calendarName);
    const start = startText ?? undefined;
    const startsAt = start === undefined ? instant(DEFAULT_START) : instant(start);
    const endsAt =
      start === undefined ? instant(DEFAULT_END) : endInstant(start, endDate, endTime ?? "");
    const response = await createTimedEvent(world.api, creator.session, calendar.id, {
      title,
      startsAt,
      endsAt,
    });
    const body = await recordResponse(world, response);
    expect(response.status(), `${who} could not create "${title}"`).toBe(201);
    rememberCreated(world, body, response.status(), title, creator.name);
  },
);

When(
  /^(\w+) creates an event "([^"]*)" in "([^"]*)" from (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) to (?:(\d{4}-\d{2}-\d{2}) )?(\d{2}:\d{2}) in UTC$/,
  async (
    { world },
    who: string,
    title: string,
    calendarName: string,
    start: string,
    endDate: string | undefined,
    endTime: string,
  ) => {
    const creator = await personNamed(world, who);
    const calendar = calendarNamed(world, calendarName);
    const response = await createTimedEvent(world.api, creator.session, calendar.id, {
      title,
      startsAt: instant(start),
      endsAt: endInstant(start, endDate, endTime),
    });
    const body = await recordResponse(world, response);
    rememberCreated(world, body, response.status(), title, creator.name);
  },
);

When(
  /^(\w+) creates an all-day event "([^"]*)" in "([^"]*)" from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})$/,
  async (
    { world },
    who: string,
    title: string,
    calendarName: string,
    startDate: string,
    endDate: string,
  ) => {
    const creator = await personNamed(world, who);
    const calendar = calendarNamed(world, calendarName);
    const response = await createAllDayEvent(world.api, creator.session, calendar.id, {
      title,
      startDate,
      endDate,
    });
    const body = await recordResponse(world, response);
    rememberCreated(world, body, response.status(), title, creator.name);
  },
);

When(
  /^(\w+) creates an all-day event "([^"]*)" in "([^"]*)" on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, who: string, title: string, calendarName: string, day: string) => {
    const creator = await personNamed(world, who);
    const calendar = calendarNamed(world, calendarName);
    const response = await createAllDayEvent(world.api, creator.session, calendar.id, {
      title,
      startDate: day,
      endDate: day,
    });
    const body = await recordResponse(world, response);
    rememberCreated(world, body, response.status(), title, creator.name);
  },
);

When(
  /^(\w+) renames the event "([^"]*)" to "([^"]*)"$/,
  async ({ world }, who: string, title: string, newTitle: string) => {
    const actor = await personNamed(world, who);
    const record = eventNamed(world, title);
    const response = await changeEvent(world.api, actor.session, record.id, { title: newTitle });
    await recordResponse(world, response);
    if (response.status() === 200) {
      record.title = newTitle;
    }
  },
);

When(
  /^(\w+) changes the end of the event "([^"]*)" to (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) in UTC$/,
  async ({ world }, who: string, title: string, end: string) => {
    const actor = await personNamed(world, who);
    const record = eventNamed(world, title);
    const response = await changeEvent(world.api, actor.session, record.id, {
      endsAt: instant(end),
    });
    await recordResponse(world, response);
  },
);

When(
  /^(\w+) moves the event "([^"]*)" to "([^"]*)"$/,
  async ({ world }, who: string, title: string, calendarName: string) => {
    const actor = await personNamed(world, who);
    const record = eventNamed(world, title);
    const target = calendarNamed(world, calendarName);
    const response = await changeEvent(world.api, actor.session, record.id, {
      calendarId: target.id,
    });
    await recordResponse(world, response);
  },
);

When(/^(\w+) deletes the event "([^"]*)"$/, async ({ world }, who: string, title: string) => {
  const actor = await personNamed(world, who);
  const record = eventNamed(world, title);
  const response = await deleteEvent(world.api, actor.session, record.id);
  await recordResponse(world, response);
  if (response.status() === 204) {
    state(world).events = state(world).events.filter((event) => event !== record);
  }
});

When(/^(\w+) reads the event "([^"]*)"$/, async ({ world }, who: string, title: string) => {
  const actor = await personNamed(world, who);
  const record = eventNamed(world, title);
  const response = await readEvent(world.api, actor.session, record.id);
  await recordResponse(world, response);
});

When(
  /^(\w+) lists the events of "([^"]*)"$/,
  async ({ world }, who: string, calendarName: string) => {
    const actor = await personNamed(world, who);
    const calendar = calendarNamed(world, calendarName);
    const response = await listEventsOf(world.api, actor.session, calendar.id);
    await recordResponse(world, response);
  },
);

Then(
  /^the event "([^"]*)" is (?:still )?stored with the start (\S+) and the end (\S+)$/,
  async ({ world }, title: string, start: string, end: string) => {
    const event = await fetchEvent(world, title);
    sameInstant(event.startsAt, start);
    sameInstant(event.endsAt, end);
  },
);

Then(
  /^the event "([^"]*)" is (?:still )?(?:stored )?in "([^"]*)"$/,
  async ({ world }, title: string, calendarName: string) => {
    const event = await fetchEvent(world, title);
    expect(event.calendarId).toBe(calendarNamed(world, calendarName).id);
  },
);

Then(
  /^the event "([^"]*)" is no longer listed in "([^"]*)"$/,
  async ({ world }, title: string, calendarName: string) => {
    const titles = await titlesSeenBy(
      world,
      ownerOf(calendarNamed(world, calendarName)),
      calendarName,
    );
    expect(titles).not.toContain(title);
  },
);

Then("the change is refused", ({ world }) => {
  expect(world.response?.status).toBeDefined();
  expect(REFUSED_STATUSES).toContain(world.response?.status);
});

Then(/^no event "([^"]*)" is stored$/, async ({ world }, title: string) => {
  expect(await titlesInEveryCalendar(world)).not.toContain(title);
});

Then(
  /^(\w+) sees the event "([^"]*)" in "([^"]*)"$/,
  async ({ world }, who: string, title: string, calendarName: string) => {
    expect(await titlesSeenBy(world, who, calendarName)).toContain(title);
  },
);

Then(
  /^(\w+) no longer sees the event "([^"]*)" in "([^"]*)"$/,
  async ({ world }, who: string, title: string, calendarName: string) => {
    expect(await titlesSeenBy(world, who, calendarName)).not.toContain(title);
  },
);

Then("the event is not found for Anna", ({ world }) => {
  expect(world.response?.status).toBe(NOT_FOUND);
});

Then(/^the calendar "([^"]*)" is not found for Carol$/, ({ world }, calendarName: string) => {
  calendarNamed(world, calendarName);
  expect(world.response?.status).toBe(NOT_FOUND);
});
