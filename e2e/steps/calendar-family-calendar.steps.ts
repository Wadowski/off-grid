// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { bearer } from "../support/family-sessions.js";
import { eventsState, sessionOf } from "../support/factories/calendar-events.js";
import type { ListedCalendar } from "../support/factories/types.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const POLL_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 500;

const createFamilyAs = async (world: ScenarioWorld, who: string, name: string): Promise<string> => {
  const session = await sessionOf(world, who);
  const response = await world.api.post("/api/families", {
    headers: bearer(session),
    data: { name },
    failOnStatusCode: false,
  });
  expect(response.status(), `${who} could not create the family "${name}"`).toBe(201);
  const { id } = (await response.json()) as { id: string };
  eventsState(world).families[name] = { id };
  return id;
};

const listCalendarsAs = async (world: ScenarioWorld, who: string): Promise<ListedCalendar[]> => {
  const session = await sessionOf(world, who);
  const response = await world.api.get("/api/calendars", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), `${who} could not list the calendars`).toBe(200);
  return ((await response.json()) as { calendars: ListedCalendar[] }).calendars;
};

const familyCalendarOf = (calendars: ListedCalendar[], name: string, familyId: string) =>
  calendars.filter((calendar) => calendar.name === name && calendar.familyId === familyId);

const modalOf = (page: Page) => page.getByTestId("new-event-modal");

const offeredCalendarNames = (page: Page): Promise<string[]> =>
  modalOf(page).locator("select option").allTextContents();

const reopenNewEventModal = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}/calendar`);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await expect(modalOf(page)).toBeVisible();
};

const selectedCalendarName = (page: Page): Promise<string | null | undefined> =>
  modalOf(page)
    .locator("select")
    .evaluate((element) => (element as HTMLSelectElement).selectedOptions[0]?.textContent);

Given("Anna creates the family {string}", async ({ world }, name: string) => {
  await createFamilyAs(world, "Anna", name);
});

Given("Ben belongs to his own family", async ({ world }) => {
  await createFamilyAs(world, "Ben", "Ben's family");
});

Then(
  "Anna sees exactly one calendar named {string} that belongs to the family",
  async ({ world }, name: string) => {
    const familyId = eventsState(world).families[name]?.id ?? "";
    await eventually(
      async () => {
        const matching = familyCalendarOf(await listCalendarsAs(world, "Anna"), name, familyId);
        expect(matching).toHaveLength(1);
        expect(matching[0]?.isDefault).toBe(true);
      },
      { timeout: POLL_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
    );
  },
);

When("Anna fetches her calendar list", async ({ world }) => {
  await listCalendarsAs(world, "Anna");
});

When("Ben fetches his calendar list", async ({ world }) => {
  await listCalendarsAs(world, "Ben");
});

Then("she sees the calendar {string}", async ({ world }, name: string) => {
  await eventually(
    async () => {
      const names = (await listCalendarsAs(world, "Anna")).map((calendar) => calendar.name);
      expect(names).toContain(name);
    },
    { timeout: POLL_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
  );
});

Then("he does not see the calendar {string}", async ({ world }, name: string) => {
  await eventually(
    async () => {
      const names = (await listCalendarsAs(world, "Ben")).map((calendar) => calendar.name);
      expect(names).toContain("Ben's family");
      expect(names).not.toContain(name);
    },
    { timeout: POLL_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
  );
});

When("Anna deletes the calendar {string}", async ({ world }, name: string) => {
  const familyId = eventsState(world).families[name]?.id ?? "";
  const calendar = await eventually(
    async () => {
      const [found] = familyCalendarOf(await listCalendarsAs(world, "Anna"), name, familyId);
      expect(found, `the calendar "${name}" is not listed yet`).toBeDefined();
      return found;
    },
    { timeout: POLL_TIMEOUT_MS, interval: POLL_INTERVAL_MS },
  );
  const response = await world.api.delete(`/api/calendars/${calendar?.id}`, {
    headers: bearer(await sessionOf(world, "Anna")),
    failOnStatusCode: false,
  });
  eventsState(world).lastStatus = response.status();
});

Then("Anna still sees the calendar {string}", async ({ world }, name: string) => {
  expect(eventsState(world).lastStatus, "the family calendar was not refused").toBe(409);
  const names = (await listCalendarsAs(world, "Anna")).map((calendar) => calendar.name);
  expect(names).toContain(name);
});

Then("the calendar {string} is offered in the new event modal", async ({ page }, name: string) => {
  await expect
    .poll(
      async () => {
        await reopenNewEventModal(page);
        return offeredCalendarNames(page);
      },
      { timeout: POLL_TIMEOUT_MS, intervals: [POLL_INTERVAL_MS] },
    )
    .toContain(name);
});

Then(
  "the calendar {string} is preselected in the new event modal",
  async ({ page }, name: string) => {
    await expect
      .poll(
        async () => {
          await reopenNewEventModal(page);
          return selectedCalendarName(page);
        },
        { timeout: POLL_TIMEOUT_MS, intervals: [POLL_INTERVAL_MS] },
      )
      .toBe(name);
  },
);
