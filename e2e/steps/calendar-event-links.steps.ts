// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { crossEntityLinkListSchema, crossEntityLinkSchema } from "@offgrid/contracts";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { bearer } from "../support/family-sessions.js";
import {
  createCalendarNamed,
  createTimedEvent,
  deleteEvent,
  changeEvent,
  eventsState,
  familyIdNamed,
  sessionOf,
  type CalendarRecord,
} from "../support/factories/calendar-events.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { MEMBER_READY_INTERVAL_MS, MEMBER_READY_TIMEOUT_MS } from "../support/timing.js";

const { Given, When, Then } = createBdd(test);

const LINKS = "/api/links";
const FAMILY_HEADER = "x-offgrid-family-id";
const EVENT_START = "2026-11-20T10:00:00Z";
const EVENT_END = "2026-11-20T11:00:00Z";
const ENTITY_TYPE = "calendar-event";

type RecordedLink = { readonly id: string; readonly sourceId: string; readonly targetId: string };

type LinkScenario = {
  readonly links: RecordedLink[];
  readonly familyOfEvent: Map<string, string>;
};

const scenarios = new WeakMap<ScenarioWorld, LinkScenario>();

const linkScenario = (world: ScenarioWorld): LinkScenario => {
  let found = scenarios.get(world);
  if (found === undefined) {
    found = { links: [], familyOfEvent: new Map() };
    scenarios.set(world, found);
  }
  return found;
};

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  const body: unknown = await response.json().catch(() => undefined);
  world.response = { status: response.status(), body };
};

const eventIdNamed = (world: ScenarioWorld, title: string): string => {
  const found = eventsState(world)
    .events.filter((event) => event.title === title)
    .at(-1);
  if (found === undefined) {
    throw new Error(`No event titled "${title}" was created in this scenario.`);
  }
  return found.id;
};

const familyHeadersFor = (
  world: ScenarioWorld,
  who: string,
  eventId: string,
): Record<string, string> => {
  const family = linkScenario(world).familyOfEvent.get(eventId);
  const isMember = family !== undefined && eventsState(world).members[family]?.includes(who);
  return isMember === true && family !== undefined
    ? { [FAMILY_HEADER]: familyIdNamed(world, family) }
    : {};
};

const linkBody = (sourceId: string, targetId: string) => ({
  sourceType: ENTITY_TYPE,
  sourceId,
  targetType: ENTITY_TYPE,
  targetId,
});

const postLink = (
  world: ScenarioWorld,
  who: string,
  session: Session,
  sourceId: string,
  targetId: string,
): Promise<APIResponse> =>
  world.api.post(LINKS, {
    headers: { ...bearer(session), ...familyHeadersFor(world, who, sourceId) },
    data: linkBody(sourceId, targetId),
    failOnStatusCode: false,
  });

const linkSettled = async (
  world: ScenarioWorld,
  who: string,
  sourceTitle: string,
  targetTitle: string,
): Promise<void> => {
  const session = await sessionOf(world, who);
  const sourceId = eventIdNamed(world, sourceTitle);
  const targetId = eventIdNamed(world, targetTitle);
  let response: APIResponse | undefined;
  await eventually(
    async () => {
      response = await postLink(world, who, session, sourceId, targetId);
      expect(response.status(), `${who} could not link "${sourceTitle}" to "${targetTitle}"`).toBe(
        201,
      );
    },
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  const created = crossEntityLinkSchema.parse(await response?.json());
  linkScenario(world).links.push({ id: created.id, sourceId, targetId });
  await recordResponse(world, response as APIResponse);
};

const attemptLink = async (
  world: ScenarioWorld,
  who: string,
  ownTitle: string,
  targetTitle: string,
): Promise<void> => {
  const session = await sessionOf(world, who);
  const sourceId = eventIdNamed(world, ownTitle);
  const targetId = eventIdNamed(world, targetTitle);
  await recordResponse(world, await postLink(world, who, session, sourceId, targetId));
};

const listLinks = async (
  world: ScenarioWorld,
  who: string,
  entityTitle: string,
): Promise<APIResponse> => {
  const session = await sessionOf(world, who);
  const entityId = eventIdNamed(world, entityTitle);
  return world.api.get(`${LINKS}?entityType=${ENTITY_TYPE}&entityId=${entityId}`, {
    headers: { ...bearer(session), ...familyHeadersFor(world, who, entityId) },
    failOnStatusCode: false,
  });
};

const titlesVisibleIn = async (
  world: ScenarioWorld,
  who: string,
  entityTitle: string,
): Promise<string[] | null> => {
  const response = await listLinks(world, who, entityTitle);
  if (response.status() === 404) {
    return null;
  }
  expect(response.status(), `${who} could not list the links of "${entityTitle}"`).toBe(200);
  return crossEntityLinkListSchema.parse(await response.json()).links.map((link) => link.title);
};

const familyCalendarOf = async (world: ScenarioWorld, family: string): Promise<CalendarRecord> => {
  const state = eventsState(world);
  const name = `${family} calendar`;
  const existing = state.calendars.find((calendar) => calendar.name === name);
  if (existing !== undefined) {
    return existing;
  }
  const admin = await sessionOf(world, `${family} admin`);
  const created = await eventually(
    () =>
      createCalendarNamed(world.api, admin, {
        name,
        familyId: familyIdNamed(world, family),
      }),
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  const record: CalendarRecord = { name, id: created.id, familyName: family };
  state.calendars.push(record);
  return record;
};

const personalCalendarOf = async (world: ScenarioWorld, who: string): Promise<CalendarRecord> => {
  const state = eventsState(world);
  const name = `${who} calendar`;
  const existing = state.calendars.find(
    (calendar) => calendar.name === name && calendar.owner === who,
  );
  if (existing !== undefined) {
    return existing;
  }
  const session = await sessionOf(world, who);
  const created = await createCalendarNamed(world.api, session, { name });
  const record: CalendarRecord = { name, id: created.id, owner: who };
  state.calendars.push(record);
  return record;
};

const createEventIn = async (
  world: ScenarioWorld,
  creator: string,
  calendar: CalendarRecord,
  title: string,
  family?: string,
): Promise<string> => {
  const session = await sessionOf(world, creator);
  let createdId = "";
  await eventually(
    async () => {
      const response = await createTimedEvent(world.api, session, calendar.id, {
        title,
        startsAt: EVENT_START,
        endsAt: EVENT_END,
      });
      expect(response.status(), `${creator} could not create "${title}"`).toBe(201);
      createdId = ((await response.json()) as { id: string }).id;
    },
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  eventsState(world).events.push({ id: createdId, title, creator });
  if (family !== undefined) {
    linkScenario(world).familyOfEvent.set(createdId, family);
  }
  await eventually(
    async () => {
      const response = await listLinks(world, creator, title);
      expect(response.status(), `"${title}" is not visible to ${creator} yet`).toBe(200);
    },
    { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
  );
  return createdId;
};

const ownEventOf = async (world: ScenarioWorld, who: string, title: string): Promise<void> => {
  const exists = eventsState(world).events.some(
    (event) => event.title === title && event.creator === who,
  );
  if (exists) {
    return;
  }
  const calendar = await personalCalendarOf(world, who);
  await createEventIn(world, who, calendar, title);
};

const familyEventOf = async (
  world: ScenarioWorld,
  creator: string,
  family: string,
  title: string,
): Promise<void> => {
  const calendar = await familyCalendarOf(world, family);
  await createEventIn(world, creator, calendar, title, family);
};

const expectNoLinks = (titles: string[] | null): void => {
  if (titles !== null) {
    expect(titles).toEqual([]);
  }
};

Given(/^Cara belongs to a family of her own$/, async ({ world }) => {
  const cara = await sessionOf(world, "Cara");
  const response = await world.api.post("/api/families", {
    headers: bearer(cara),
    data: { name: "Cara family" },
    failOnStatusCode: false,
  });
  expect(response.status(), "Cara could not create her family").toBe(201);
});

Given(
  /^Anna has an event "([^"]*)" in a family calendar of "([^"]*)"$/,
  async ({ world }, title: string, family: string) => {
    await familyEventOf(world, "Anna", family, title);
  },
);

Given(
  /^Anna has linked the event "([^"]*)" to the event "([^"]*)"$/,
  async ({ world }, sourceTitle: string, targetTitle: string) => {
    await linkSettled(world, "Anna", sourceTitle, targetTitle);
  },
);

Given(
  /^Ben has linked his own event "([^"]*)" to the event "([^"]*)"$/,
  async ({ world }, ownTitle: string, targetTitle: string) => {
    await ownEventOf(world, "Ben", ownTitle);
    await linkSettled(world, "Ben", ownTitle, targetTitle);
  },
);

When(
  /^Anna links the event "([^"]*)" to the event "([^"]*)"$/,
  async ({ world }, sourceTitle: string, targetTitle: string) => {
    await linkSettled(world, "Anna", sourceTitle, targetTitle);
  },
);

When(
  /^Anna removes the link between "([^"]*)" and "([^"]*)"$/,
  async ({ world }, sourceTitle: string, targetTitle: string) => {
    const sourceId = eventIdNamed(world, sourceTitle);
    const targetId = eventIdNamed(world, targetTitle);
    const link = linkScenario(world).links.find(
      (candidate) => candidate.sourceId === sourceId && candidate.targetId === targetId,
    );
    expect(link, `no link from "${sourceTitle}" to "${targetTitle}" was made`).toBeDefined();
    const session = await sessionOf(world, "Anna");
    const response = await world.api.delete(`${LINKS}/${link?.id ?? ""}`, {
      headers: { ...bearer(session), ...familyHeadersFor(world, "Anna", sourceId) },
      failOnStatusCode: false,
    });
    await recordResponse(world, response);
  },
);

When(
  /^Cara tries to link her own event to the event "([^"]*)"$/,
  async ({ world }, targetTitle: string) => {
    await ownEventOf(world, "Cara", "Cara own event");
    await attemptLink(world, "Cara", "Cara own event", targetTitle);
  },
);

When(
  /^Ben tries to link his own event to the event "([^"]*)"$/,
  async ({ world }, targetTitle: string) => {
    await ownEventOf(world, "Ben", "Ben own event");
    await attemptLink(world, "Ben", "Ben own event", targetTitle);
  },
);

When(
  /^Ben links his own event "([^"]*)" to the event "([^"]*)"$/,
  async ({ world }, ownTitle: string, targetTitle: string) => {
    await ownEventOf(world, "Ben", ownTitle);
    await linkSettled(world, "Ben", ownTitle, targetTitle);
  },
);

Then(
  /^Anna sees the link to "([^"]*)" in the links of "([^"]*)"$/,
  async ({ world }, targetTitle: string, entityTitle: string) => {
    await eventually(
      async () => {
        const titles = await titlesVisibleIn(world, "Anna", entityTitle);
        expect(titles).toContain(targetTitle);
      },
      { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
    );
  },
);

Then(
  /^Ben sees the link to "([^"]*)" in the links of "([^"]*)"$/,
  async ({ world }, targetTitle: string, entityTitle: string) => {
    await eventually(
      async () => {
        const titles = await titlesVisibleIn(world, "Ben", entityTitle);
        expect(titles).toContain(targetTitle);
      },
      { timeout: MEMBER_READY_TIMEOUT_MS, interval: MEMBER_READY_INTERVAL_MS },
    );
  },
);

Then(/^Anna sees no links in the links of "([^"]*)"$/, async ({ world }, entityTitle: string) => {
  await eventually(async () => expectNoLinks(await titlesVisibleIn(world, "Anna", entityTitle)), {
    timeout: MEMBER_READY_TIMEOUT_MS,
    interval: MEMBER_READY_INTERVAL_MS,
  });
});

Then(/^Cara sees no links in the links of "([^"]*)"$/, async ({ world }, entityTitle: string) => {
  expectNoLinks(await titlesVisibleIn(world, "Cara", entityTitle));
});

Then(
  /^Ben cannot see the links in the links of "([^"]*)"$/,
  async ({ world }, entityTitle: string) => {
    await eventually(async () => expectNoLinks(await titlesVisibleIn(world, "Ben", entityTitle)), {
      timeout: MEMBER_READY_TIMEOUT_MS,
      interval: MEMBER_READY_INTERVAL_MS,
    });
  },
);

Then(/^Cara is told the event cannot be found$/, ({ world }) => {
  expect(world.response?.status).toBe(404);
});

Then(/^Ben is told the event cannot be found$/, ({ world }) => {
  expect(world.response?.status).toBe(404);
});
