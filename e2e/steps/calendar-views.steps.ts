// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { accountSessionOf, bearer } from "../support/family-sessions.js";
import type { CalendarEventsWorld } from "../support/factories/calendar-events.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const PRONOUNS = ["she", "he"];

type Session = CalendarEventsWorld["people"][string];

type ViewDayBody = { date: string; events: { title: string }[] };
type ViewBody = { view: string; startDate: string; endDate: string; days: ViewDayBody[] };

const eventsState = (world: ScenarioWorld): CalendarEventsWorld => {
  world.calendarEvents ??= { people: {}, families: {}, members: {}, calendars: [], events: [] };
  return world.calendarEvents;
};

const sessionOf = async (world: ScenarioWorld, who: string): Promise<Session> => {
  const scenario = eventsState(world);
  const name = PRONOUNS.includes(who) ? (scenario.actor ?? "Anna") : who;
  let session = scenario.people[name];
  if (session === undefined) {
    session =
      name === "Anna" && world.people?.anna !== undefined
        ? world.people.anna.session
        : (await accountSessionOf(world.api, name)).session;
    scenario.people[name] = session;
  }
  return session;
};

const fetchView = async (
  world: ScenarioWorld,
  who: string,
  view: string,
  date: string,
): Promise<ViewBody> => {
  const session = await sessionOf(world, who);
  const response = await world.api.get(`/api/calendar/views/${view}?date=${date}`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), `the ${view} view could not be read`).toBe(200);
  return (await response.json()) as ViewBody;
};

const openedView = async (world: ScenarioWorld, view: string): Promise<ViewBody> => {
  const opened = world.calendarViews?.opened;
  if (opened === undefined) {
    throw new Error("No view was opened in this scenario.");
  }
  expect(opened.view, "the opened view and the checked view differ").toBe(view);
  return fetchView(world, opened.who, opened.view, opened.date);
};

const titlesOf = (body: ViewBody): string[] =>
  body.days.flatMap((day) => day.events.map((event) => event.title));

const titlesOn = (body: ViewBody, date: string): string[] =>
  body.days.find((day) => day.date === date)?.events.map((event) => event.title) ?? [];

When(
  /^(\w+) opens (?:her|his) (agenda|day|week|month) view for (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, who: string, view: string, date: string) => {
    world.calendarViews = { opened: { who, view, date } };
    await fetchView(world, who, view, date);
  },
);

When(/^(\w+) steps out of the family "([^"]*)"$/, async ({ world }, who: string, family: string) => {
  const session = await sessionOf(world, who);
  const familyId = eventsState(world).families[family]?.id;
  expect(familyId, `the family "${family}" is not set up`).toBeDefined();
  const response = await world.api.delete(`/api/families/${familyId}/members/${session.userId}`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
});

Then(
  /^the (agenda|day|week|month) view starts on (\d{4}-\d{2}-\d{2}) and ends on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, view: string, startDate: string, endDate: string) => {
    await eventually(async () => {
      const body = await openedView(world, view);
      expect(body.startDate).toBe(startDate);
      expect(body.endDate).toBe(endDate);
    });
  },
);

Then(
  /^the (agenda|day|week|month) view covers each of its (\d+) days exactly once$/,
  async ({ world }, view: string, count: string) => {
    const body = await openedView(world, view);
    const dates = body.days.map((day) => day.date);
    expect(dates).toHaveLength(Number(count));
    expect(new Set(dates).size).toBe(Number(count));
  },
);

Then(
  /^the (agenda|day|week|month) view lists "([^"]*)"$/,
  async ({ world }, view: string, title: string) => {
    await eventually(async () => {
      expect(titlesOf(await openedView(world, view))).toContain(title);
    });
  },
);

Then(
  /^the (agenda|day|week|month) view does not list "([^"]*)"$/,
  async ({ world }, view: string, title: string) => {
    await eventually(async () => {
      expect(titlesOf(await openedView(world, view))).not.toContain(title);
    });
  },
);

Then(
  /^the (agenda|day|week|month) view shows "([^"]*)" on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, view: string, title: string, date: string) => {
    await eventually(async () => {
      expect(titlesOn(await openedView(world, view), date)).toContain(title);
    });
  },
);

Then(
  /^the (agenda|day|week|month) view does not show "([^"]*)" on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, view: string, title: string, date: string) => {
    await eventually(async () => {
      expect(titlesOn(await openedView(world, view), date)).not.toContain(title);
    });
  },
);
