// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { bearer } from "../support/family-sessions.js";
import {
  CALENDAR_COLOR,
  eventsState,
  familyIdNamed,
  sessionOf,
  type CalendarRecord,
} from "../support/factories/calendar-events.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-78 follow-up): ${step}`);
};

type ListedCalendar = { id: string; name: string };

const calendarNamed = (world: ScenarioWorld, name: string): CalendarRecord => {
  const record = eventsState(world).calendars.find((item) => item.name === name);
  if (record === undefined) {
    throw new Error(`The calendar "${name}" is not set up in this scenario.`);
  }
  return record;
};

const listedCalendarsOf = async (world: ScenarioWorld, who: string): Promise<ListedCalendar[]> => {
  const session = await sessionOf(world, who);
  const response = await world.api.get("/api/calendars", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), `${who} could not list the calendars`).toBe(200);
  return ((await response.json()) as { calendars: ListedCalendar[] }).calendars;
};

const expectLastStatusNotFound = (world: ScenarioWorld): void => {
  expect(eventsState(world).lastStatus, "the last request was not refused as not-found").toBe(404);
};

Given(/^Anna belongs to the family "[^"]*" and has a personal calendar named "[^"]*"$/, () =>
  notImplemented("Anna belongs to the family {string} and has a personal calendar named {string}"),
);

Given(/^Ben belongs to his own family and has a personal calendar named "[^"]*"$/, () =>
  notImplemented("Ben belongs to his own family and has a personal calendar named {string}"),
);

When(/^Anna lists her calendars$/, () => notImplemented("Anna lists her calendars"));

Then(/^she sees "[^"]*" and "[^"]*"$/, () => notImplemented("she sees {string} and {string}"));

Then(/^she does not see "[^"]*"$/, () => notImplemented("she does not see {string}"));

When(/^she creates a personal calendar named "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented("she creates a personal calendar named {string} with the color {string}"),
);

Then(/^the calendar "[^"]*" exists with the color "[^"]*" for Anna only$/, () =>
  notImplemented("the calendar {string} exists with the color {string} for Anna only"),
);

When(/^Ben creates a calendar named "[^"]*" in the family "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented(
    "Ben creates a calendar named {string} in the family {string} with the color {string}",
  ),
);

Then(/^Anna sees the calendar "[^"]*"$/, () => notImplemented("Anna sees the calendar {string}"));

Given(/^the family "[^"]*" has a calendar named "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented("the family {string} has a calendar named {string} with the color {string}"),
);

When(/^Ben renames the calendar "[^"]*" to "[^"]*" and recolors it "[^"]*"$/, () =>
  notImplemented("Ben renames the calendar {string} to {string} and recolors it {string}"),
);

Then(/^the calendar "[^"]*" has the color "[^"]*"$/, () =>
  notImplemented("the calendar {string} has the color {string}"),
);

Given(/^the family "[^"]*" has a calendar named "[^"]*" with two events$/, () =>
  notImplemented("the family {string} has a calendar named {string} with two events"),
);

When(/^Ben deletes the calendar "[^"]*"$/, () =>
  notImplemented("Ben deletes the calendar {string}"),
);

Then(/^the calendar "[^"]*" no longer exists$/, () =>
  notImplemented("the calendar {string} no longer exists"),
);

Then(/^a "[^"]*" event is published for each of its two events$/, () =>
  notImplemented("a {string} event is published for each of its two events"),
);

Given(/^Anna has her default calendar$/, () => notImplemented("Anna has her default calendar"));

When(/^Anna deletes her default calendar$/, () =>
  notImplemented("Anna deletes her default calendar"),
);

Then(/^the default calendar still exists$/, () =>
  notImplemented("the default calendar still exists"),
);

When(/^Ben looks at the calendar "[^"]*"$/, () =>
  notImplemented("Ben looks at the calendar {string}"),
);

Then(/^Ben cannot see the calendar "[^"]*"$/, () =>
  notImplemented("Ben cannot see the calendar {string}"),
);
Then(/^Ben cannot use the family "([^"]*)"$/, ({ world }, family: string) => {
  familyIdNamed(world, family);
  expectLastStatusNotFound(world);
});
Then(/^the name is refused as invalid$/, () => notImplemented("the name is refused as invalid"));

When(
  /^Ben renames the calendar "([^"]*)" to "([^"]*)"$/,
  async ({ world }, from: string, to: string) => {
    const record = calendarNamed(world, from);
    const session = await sessionOf(world, "Ben");
    const response = await world.api.patch(`/api/calendars/${record.id}`, {
      headers: bearer(session),
      data: { name: to },
      failOnStatusCode: false,
    });
    eventsState(world).lastStatus = response.status();
  },
);

Then(
  /^the calendar "([^"]*)" is still named "([^"]*)"$/,
  async ({ world }, original: string, expected: string) => {
    const record = calendarNamed(world, original);
    const viewer = record.owner ?? `${record.familyName ?? ""} admin`;
    const listed = await listedCalendarsOf(world, viewer);
    expect(listed.find((calendar) => calendar.id === record.id)?.name).toBe(expected);
  },
);

Then(/^the calendar "[^"]*" still exists$/, () =>
  notImplemented("the calendar {string} still exists"),
);

When(
  /^Ben creates a calendar named "([^"]*)" in the family "([^"]*)"$/,
  async ({ world }, name: string, family: string) => {
    const session = await sessionOf(world, "Ben");
    const response = await world.api.post("/api/calendars", {
      headers: bearer(session),
      data: { name, color: CALENDAR_COLOR, familyId: familyIdNamed(world, family) },
      failOnStatusCode: false,
    });
    eventsState(world).lastStatus = response.status();
  },
);

Then(/^Ben gets not-found for the family "([^"]*)"$/, ({ world }, family: string) => {
  familyIdNamed(world, family);
  expectLastStatusNotFound(world);
});

When(/^Ben leaves the family "([^"]*)"$/, async ({ world }, family: string) => {
  const session = await sessionOf(world, "Ben");
  const response = await world.api.delete(
    `/api/families/${familyIdNamed(world, family)}/members/${session.userId}`,
    { headers: bearer(session), failOnStatusCode: false },
  );
  expect(response.status()).toBe(204);
});

Then(/^Ben does not see "([^"]*)"$/, async ({ world }, name: string) => {
  await eventually(async () => {
    expect((await listedCalendarsOf(world, "Ben")).map((calendar) => calendar.name)).not.toContain(
      name,
    );
  });
});

Then(/^the request fails with a validation error$/, () =>
  notImplemented("the request fails with a validation error"),
);

Given(/^Ben belongs to his own family$/, () => notImplemented("Ben belongs to his own family"));
