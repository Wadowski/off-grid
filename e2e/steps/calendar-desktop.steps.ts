// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { createAllDayEvent } from "../support/factories/calendar-events.js";
import { test } from "../support/fixtures.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";
import { calendarIdOf } from "../support/world-calendar-id.js";

const { When, Then, Given } = createBdd(test);

const DESKTOP_HEIGHT = 900;
const SIDEBAR = "calendar-sidebar";
const AGENDA_PATHS = ["/calendar", "/calendar/agenda"];

// Monday is column 0, Sunday is column 6.
const weekColumnOf = (date: string): number => {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (weekday + 6) % 7;
};

const weekColumn = (page: Page, date: string) =>
  page.getByTestId("week-day-column").nth(weekColumnOf(date));

const sidebarCheckbox = (page: Page, name: string) =>
  page.getByTestId(SIDEBAR).getByRole("checkbox", { name, exact: true });

const openAt = async (page: Page, path: string, width: number): Promise<void> => {
  await page.setViewportSize({ width, height: DESKTOP_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

Given("the browser blocks saved preferences", async ({ page }) => {
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.getItem = blocked;
    Storage.prototype.setItem = blocked;
  });
});

When(
  "I open the agenda view for {word} at a desktop width of 1280 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar?date=${date}`, 1280);
  },
);

Then(
  "I see {string} in the calendar sidebar with a checked show checkbox",
  async ({ page }, name: string) => {
    await expect(sidebarCheckbox(page, name)).toBeChecked();
  },
);

Then("the calendar {string} is checked in the calendar sidebar", async ({ page }, name: string) => {
  await expect(sidebarCheckbox(page, name)).toBeChecked();
});

Then(
  "the calendar {string} is unchecked in the calendar sidebar",
  async ({ page }, name: string) => {
    await expect(sidebarCheckbox(page, name)).not.toBeChecked();
  },
);

When("I hide the calendar {string} in the calendar sidebar", async ({ page }, name: string) => {
  await sidebarCheckbox(page, name).uncheck();
});

When("I show the calendar {string} in the calendar sidebar", async ({ page }, name: string) => {
  await sidebarCheckbox(page, name).check();
});

Then(
  /^the agenda (?:still )?shows the day (\d{4}-\d{2}-\d{2})$/,
  async ({ page }, date: string) => {
    const url = new URL(page.url());
    expect(AGENDA_PATHS).toContain(url.pathname);
    expect(url.searchParams.get("date")).toBe(date);
  },
);

When("I choose the week view in the view tabs", async ({ page }) => {
  await page
    .getByRole("group", { name: "Calendar view" })
    .getByRole("button", { name: "Week", exact: true })
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/calendar/week");
});

Then("I do not see the event {string} in the week grid", async ({ page }, title: string) => {
  await expect(page.getByTestId("week-grid")).toBeVisible();
  await expect(page.getByTestId("week-grid").getByText(title, { exact: true })).toHaveCount(0);
});

When("I move to the next week in the agenda", async ({ page }) => {
  await page.getByRole("button", { name: "Next", exact: true }).click();
});

When("I move to the previous week in the agenda", async ({ page }) => {
  await page.getByRole("button", { name: "Previous", exact: true }).click();
});

When("I choose {string} in the calendar sidebar", async ({ page }, label: string) => {
  await page.getByTestId(SIDEBAR).getByRole("link", { name: label, exact: true }).click();
});

When("I select {word} in the mini month", async ({ page }, date: string) => {
  await page.getByTestId(`mini-month-day-${date}`).click();
});

Then("the page has no serious accessibility violations in the light theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  expect(await blockingViolationDescriptions(page)).toEqual([]);
});

Then("the page has no serious accessibility violations in the dark theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  expect(await blockingViolationDescriptions(page)).toEqual([]);
});

Given(
  /^the all-day event "([^"]+)" is in "([^"]+)" from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2}) in UTC$/,
  async ({ world }, title: string, calendarName: string, startDate: string, endDate: string) => {
    const response = await createAllDayEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      { title, startDate, endDate },
    );
    expect(response.status(), `could not create the all-day event "${title}"`).toBe(201);
  },
);

When(
  "I open the week view for {word} at a desktop width of 1280 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar/week?date=${date}`, 1280);
  },
);

Then(
  "I see the event {string} in the week column for {word}",
  async ({ page }, title: string, date: string) => {
    await expect(
      weekColumn(page, date)
        .getByTestId(/^week-event-/)
        .getByText(title, { exact: true }),
    ).toBeVisible();
  },
);

Then(
  "I see the time range {string} on the week event {string}",
  async ({ page }, range: string, title: string) => {
    const card = page.getByTestId(/^week-event-/).filter({ hasText: title });
    await expect(card.getByText(range, { exact: true })).toBeVisible();
  },
);

Then(
  "I do not see the event {string} in the week column for {word}",
  async ({ page }, title: string, date: string) => {
    await expect(weekColumn(page, date).getByText(title, { exact: true })).toHaveCount(0);
  },
);

Then(
  "I see one all-day bar {string} across the week columns from {word} to {word}",
  async ({ page }, title: string, first: string, last: string) => {
    const bar = page.getByTestId("week-grid").getByText(title, { exact: true });
    await expect(bar).toHaveCount(1);
    const box = await bar.boundingBox();
    const firstColumn = await weekColumn(page, first).boundingBox();
    const lastColumn = await weekColumn(page, last).boundingBox();
    expect(box, "the all-day bar has no position").not.toBeNull();
    expect(firstColumn).not.toBeNull();
    expect(lastColumn).not.toBeNull();
    expect(box?.x ?? 0).toBeGreaterThanOrEqual((firstColumn?.x ?? 0) - 1);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      (lastColumn?.x ?? 0) + (lastColumn?.width ?? 0) + 1,
    );
  },
);
