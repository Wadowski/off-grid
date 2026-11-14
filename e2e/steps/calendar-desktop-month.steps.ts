// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { createAllDayEvent, createTimedEvent } from "../support/factories/calendar-events.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const DESKTOP_HEIGHT = 900;
const MONTH_PREFIX = "2026-11-";
// Upper bound for Tab presses when walking to a target. The sidebar, the mini month and the
// header come before the grid, so the bound is generous.
const MAX_TAB_PRESSES = 300;

const calendarIdOf = (world: ScenarioWorld, name: string): string => {
  const id = world.calendarIds?.[name];
  if (id === undefined) {
    throw new Error(`The calendar "${name}" was not set up in this scenario.`);
  }
  return id;
};

const desktopGrid = (page: Page): Locator =>
  page.getByRole("region", { name: "Month days, desktop", exact: true });

const dayCell = (page: Page, date: string): Locator =>
  page.getByTestId(`month-desktop-cell-${date}`);

// The chip's text is its exact title; the name (title and time) is read through getByRole.
const chipTitled = (page: Page, title: string): Locator =>
  page
    .locator('[data-testid^="month-event-chip-"]')
    .filter({ has: page.getByText(title, { exact: true }) });

const openMonthAt = async (
  page: Page,
  date: string,
  width: number,
  colorScheme?: "light" | "dark",
): Promise<void> => {
  await page.setViewportSize({ width, height: DESKTOP_HEIGHT });
  if (colorScheme !== undefined) {
    await page.emulateMedia({ colorScheme });
  }
  await page.goto(`${webBaseUrl()}/calendar/month?date=${date}`);
};

// Presses Tab until the target element holds the focus.
const tabUntilFocused = async (page: Page, target: Locator, description: string): Promise<void> => {
  for (let press = 0; press < MAX_TAB_PRESSES; press += 1) {
    await page.keyboard.press("Tab");
    const focused = await target.evaluate(
      (element) => element === element.ownerDocument.activeElement,
    );
    if (focused) {
      return;
    }
  }
  throw new Error(`Tab did not reach ${description} within ${MAX_TAB_PRESSES} presses.`);
};

Given(
  /^the event "([^"]+)" is in "([^"]+)" from (\d{4}-\d{2}-\d{2}) all day to (\d{4}-\d{2}-\d{2}) all day in UTC$/,
  async ({ world }, title: string, calendarName: string, startDate: string, endDate: string) => {
    const response = await createAllDayEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      { title, startDate, endDate },
    );
    expect(response.status(), `could not create the event "${title}"`).toBe(201);
  },
);

Given(
  /^the events (.+) are in "([^"]+)" on (\d{4}-\d{2}-\d{2})$/,
  async ({ world }, titleList: string, calendarName: string, date: string) => {
    const titles = [...titleList.matchAll(/"([^"]+)"/g)].map((match) => match[1] ?? "");
    for (const [index, title] of titles.entries()) {
      const hour = String(9 + index).padStart(2, "0");
      const response = await createTimedEvent(
        world.api,
        memberSessionOf(world),
        calendarIdOf(world, calendarName),
        { title, startsAt: `${date}T${hour}:00:00Z`, endsAt: `${date}T${hour}:30:00Z` },
      );
      expect(response.status(), `could not create the event "${title}"`).toBe(201);
    }
  },
);

When(
  /^I open the month view for (\d{4}-\d{2}-\d{2}) at a (?:desktop )?width of (\d+) pixels$/,
  async ({ page }, date: string, width: string) => {
    await openMonthAt(page, date, Number(width));
  },
);

When(
  /^I open the month view for (\d{4}-\d{2}-\d{2}) at a desktop width of (\d+) pixels in the (light|dark) theme$/,
  async ({ page }, date: string, width: string, theme: "light" | "dark") => {
    await openMonthAt(page, date, Number(width), theme);
  },
);

When("I move the focus with the Tab key to the day {word}", async ({ page }, date: string) => {
  await tabUntilFocused(page, page.getByTestId(`month-desktop-day-${date}`), `the day ${date}`);
});

When("I press Enter", async ({ page }) => {
  await page.keyboard.press("Enter");
});

When("I choose {string} on {word}", async ({ page }, text: string, date: string) => {
  await dayCell(page, date).getByRole("button", { name: text, exact: true }).click();
});

Then("I see the days of November 2026 in the month grid", async ({ page }) => {
  await expect(desktopGrid(page)).toBeVisible();
  await expect(page.locator(`[data-testid^="month-desktop-day-${MONTH_PREFIX}"]`)).toHaveCount(30);
});

Then(
  /^I see the event "([^"]+)" on (\d{4}-\d{2}-\d{2})(?: in the month grid)?$/,
  async ({ page }, title: string, date: string) => {
    await expect(dayCell(page, date).getByText(title, { exact: true })).toBeVisible();
  },
);

Then("I do not see the event {string} on {word}", async ({ page }, title: string, date: string) => {
  await expect(dayCell(page, date).getByText(title, { exact: true })).toHaveCount(0);
});

Then("I see the text {string} on {word}", async ({ page }, text: string, date: string) => {
  await expect(dayCell(page, date).getByRole("button", { name: text, exact: true })).toBeVisible();
});

Then("I see the day view for {word}", async ({ page }, date: string) => {
  await expect.poll(() => new URL(page.url()).pathname).toBe("/calendar/day");
  expect(new URL(page.url()).searchParams.get("date")).toBe(date);
});

Then(
  "the event {string} in the month grid is named {string}",
  async ({ page }, title: string, name: string) => {
    await expect(chipTitled(page, title)).toHaveCount(1);
    await expect(page.getByRole("img", { name, exact: true })).toBeVisible();
  },
);

Then("I see the desktop month grid", async ({ page }) => {
  await expect(desktopGrid(page)).toBeVisible();
});

Then("I see the mobile month grid", async ({ page }) => {
  await expect(page.getByRole("group", { name: "Month days", exact: true })).toBeVisible();
});

Then("the page does not scroll horizontally", async ({ page }) => {
  const overflows = await page.evaluate(
    "document.documentElement.scrollWidth > document.documentElement.clientWidth",
  );
  expect(overflows).toBe(false);
});
