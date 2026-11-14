// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { createTimedEvent } from "../support/factories/calendar-events.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

// The accent colour of each calendar colour, as the day timeline paints it (calendar-accents.ts).
const ACCENT_BACKGROUND: Record<string, string> = {
  blue: "rgb(59, 111, 212)",
};

const calendarIdOf = (world: ScenarioWorld, name: string): string => {
  const id = world.calendarIds?.[name];
  if (id === undefined) {
    throw new Error(`The calendar "${name}" was not set up in this scenario.`);
  }
  return id;
};

const eventBlock = (page: Page, title: string) =>
  page.getByTestId("day-timeline").locator("article").filter({ hasText: title });

const DESKTOP_HEIGHT = 900;
const COMMAND_ROW = "day-command-row";

const commandRow = (page: Page) => page.getByTestId(COMMAND_ROW);

const openAt = async (page: Page, path: string, width: number): Promise<void> => {
  await page.setViewportSize({ width, height: DESKTOP_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

Given(
  /^the event "([^"]+)" is in "([^"]+)" at "([^"]+)" from (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) to (\d{2}:\d{2}) in UTC$/,
  async (
    { world },
    title: string,
    calendarName: string,
    location: string,
    date: string,
    start: string,
    end: string,
  ) => {
    const response = await createTimedEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      { title, location, startsAt: `${date}T${start}:00Z`, endsAt: `${date}T${end}:00Z` },
    );
    expect(response.status(), `could not create the event "${title}"`).toBe(201);
  },
);

Then("the day timeline is shown", async ({ page }) => {
  await expect(page.getByTestId("day-timeline")).toBeVisible();
});

Then(
  "I see the event {string} as a block with the calendar colour {string}",
  async ({ page }, title: string, colour: string) => {
    const accent = eventBlock(page, title).locator('span[aria-hidden="true"]').first();
    await expect(accent).toHaveCSS("background-color", ACCENT_BACKGROUND[colour] ?? colour);
  },
);

Then(
  "I see the time range {string} and the location {string} on the event {string}",
  async ({ page }, range: string, location: string, title: string) => {
    const block = eventBlock(page, title);
    await expect(block).toContainText(range);
    await expect(block).toContainText(location);
  },
);

When(
  "I open the day view for {word} at a desktop width of 1280 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar/day?date=${date}`, 1280);
  },
);

Then("I see the day heading {string}", async ({ page }, heading: string) => {
  await expect(commandRow(page).getByRole("heading", { name: heading, exact: true })).toBeVisible();
});

Then(
  "I see the controls {string}, {string} and {string} in the day command row",
  async ({ page }, previous: string, today: string, next: string) => {
    const row = commandRow(page);
    await expect(row.getByRole("button", { name: previous, exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: today, exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: next, exact: true })).toBeVisible();
  },
);

Then("I see the view selector in the day command row", async ({ page }) => {
  await expect(commandRow(page).getByRole("combobox", { name: "Calendar view" })).toBeVisible();
});

When("I choose the next period in the day command row", async ({ page }) => {
  await commandRow(page).getByRole("button", { name: "Next", exact: true }).click();
});

When("I choose the previous period in the day command row", async ({ page }) => {
  await commandRow(page).getByRole("button", { name: "Previous", exact: true }).click();
});

When(
  "I check the desktop day view for accessibility in light and dark theme",
  async ({ page, world }) => {
    const violations: string[] = [];
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await openAt(page, "/calendar/day?date=2026-11-18", 1280);
      await expect(commandRow(page)).toBeVisible();
      violations.push(
        ...(await blockingViolationDescriptions(page)).map((item) => `${scheme} day view: ${item}`),
      );
    }
    world.accessibilityViolations = violations;
  },
);
