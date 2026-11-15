// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { createTimedEvent } from "../support/factories/calendar-events.js";
import { test } from "../support/fixtures.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";
import { calendarIdOf } from "../support/world-calendar-id.js";

const { Given, When, Then } = createBdd(test);

const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const WEEK_STRIP_WRAPPER_CLASS = "og-calendar-views-week-strip";
const VIEWS_API = "**/api/calendar/views/**";
const TIMELINE_OFFSET_PX = 12;
const TIMELINE_HOUR_PX = 88;

const minutesOf = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const timelineTopPx = (time: string): number =>
  TIMELINE_OFFSET_PX + (minutesOf(time) * TIMELINE_HOUR_PX) / 60;

const clock12 = (time: string): string => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const meridiem = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${meridiem}`;
};

const openAt = async (page: Page, path: string): Promise<void> => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

const eventCard = (page: Page, title: string) =>
  page.getByRole("listitem").filter({ hasText: title });

Given(
  /^the event "([^"]+)" is in "([^"]+)" from (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) (?:to|until) (?:(\d{4}-\d{2}-\d{2}) )?(\d{2}:\d{2}) in UTC$/,
  async (
    { world },
    title: string,
    calendarName: string,
    date: string,
    start: string,
    endDate: string | undefined,
    end: string,
  ) => {
    const response = await createTimedEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      { title, startsAt: `${date}T${start}:00Z`, endsAt: `${endDate ?? date}T${end}:00Z` },
    );
    expect(response.status(), `could not create the event "${title}"`).toBe(201);
  },
);

Given("the calendar views service fails for the next request", async ({ page }) => {
  let failed = false;
  await page.route(VIEWS_API, async (route) => {
    if (!failed) {
      failed = true;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ code: "INTERNAL", message: "boom" }),
      });
      return;
    }
    await route.continue();
  });
});

When(
  "I open the agenda view for {word} at a phone width of 375 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar?date=${date}`);
  },
);

When("I open the calendar from the navigation at a phone width of 375 pixels", async ({ page }) => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}/`);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Calendar" })
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/calendar");
});

Then(
  "I see the week strip from {word} to {word}",
  async ({ page }, first: string, last: string) => {
    await expect(page.getByTestId(`week-strip-${first}`)).toBeVisible();
    await expect(page.getByTestId(`week-strip-${last}`)).toBeVisible();
  },
);

Then(
  "I see the event {string} in the agenda for {word}",
  async ({ page }, title: string, date: string) => {
    expect(new URL(page.url()).searchParams.get("date")).toBe(date);
    await expect(eventCard(page, title)).toBeVisible();
  },
);

When("I choose the day view in the view tabs", async ({ page }) => {
  await page
    .getByRole("group", { name: "Calendar view" })
    .getByRole("button", { name: "Day", exact: true })
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/calendar/day");
});

When(
  "I open the day view for {word} at a phone width of 375 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar/day?date=${date}`);
  },
);

When("I untick the calendar {string} in the calendar filter", async ({ page }, name: string) => {
  await page.getByRole("button", { name: /^Calendar filter/ }).click();
  await page
    .getByRole("group", { name: "Calendar filter" })
    .getByRole("checkbox", { name: name })
    .uncheck();
});

Then("I see the view tabs", async ({ page }) => {
  await expect(page.getByRole("group", { name: "Calendar view" })).toBeVisible();
});

Then("I see the calendar filter", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Calendar filter/ })).toBeVisible();
});

Then("I do not see the text {string} on the calendar page", async ({ page }, text: string) => {
  await expect(page.getByRole("main").getByText(text, { exact: true })).toHaveCount(0);
});

Then("I do not see a search button", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Search", exact: true })).toHaveCount(0);
});

Then("I see the event {string} in the agenda", async ({ page }, title: string) => {
  await expect(eventCard(page, title)).toBeVisible();
});

Then("I do not see the event {string} in the agenda", async ({ page }, title: string) => {
  await expect(eventCard(page, title)).toHaveCount(0);
});

Then("the {string} action is fixed at the bottom of the screen", async ({ page }, name: string) => {
  const action = page.getByRole("button", { name, exact: true });
  await expect(action).toBeVisible();
  const footer = page.getByTestId("calendar-views-footer");
  await expect(footer).toHaveCSS("position", "fixed");
});

Then("the calendar grid spans the phone width edge to edge", async ({ page }) => {
  const grid = page.getByTestId("week-grid").or(page.getByTestId("day-timeline"));
  await expect(grid).toBeVisible();
  const box = await grid.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x ?? 1).toBeLessThanOrEqual(0.5);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeGreaterThanOrEqual(PHONE_WIDTH - 0.5);
});

Then(
  "I see the event {string} placed between {word} and {word} on the timeline",
  async ({ page }, title: string, start: string, end: string) => {
    const block = page.locator("article").filter({ hasText: title });
    await expect(block).toHaveCount(1);
    await expect(block).toHaveCSS("top", `${timelineTopPx(start)}px`);
    await expect(block).toContainText(`${clock12(start)} - ${clock12(end)}`);
  },
);

Then("I see the text {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible();
});

Then("I see a retry action", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

When(
  "I check the agenda view and the day timeline for accessibility in light and dark theme",
  async ({ page, world }) => {
    const violations: string[] = [];
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      for (const path of ["/calendar?date=2026-11-18", "/calendar/day?date=2026-11-18"]) {
        await openAt(page, path);
        await expect(page.getByRole("heading", { name: "Calendar", exact: true })).toBeVisible();
        violations.push(
          ...(await blockingViolationDescriptions(page)).map(
            (item) => `${scheme} ${path}: ${item}`,
          ),
        );
      }
    }
    world.accessibilityViolations = violations;
  },
);

When(
  "I open the week view for {word} at a phone width of 375 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar/week?date=${date}`);
  },
);

Then(
  "I see seven day columns from Monday {word} to Sunday {word}",
  async ({ page }, first: string, last: string) => {
    await expect(page.getByTestId("week-day-column")).toHaveCount(7);
    await expect(
      page.getByText(String(Number(first.slice(8))), { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(String(Number(last.slice(8))), { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I see the event {string} in the {word} column",
  async ({ page }, title: string, day: string) => {
    const index = day === "Monday" ? 0 : 6;
    await expect(page.getByTestId("week-day-column").nth(index).getByText(title)).toBeVisible();
  },
);

When(
  "I open the month view for {word} at a phone width of 375 pixels",
  async ({ page }, date: string) => {
    await openAt(page, `/calendar/month?date=${date}`);
  },
);

When("I tap the day {word}", async ({ page }, date: string) => {
  await page.getByTestId(`month-day-${date}`).click();
});

Then("I see the event {string} in the day sheet", async ({ page }, title: string) => {
  const sheet = page.getByRole("region", { name: "Selected day" });
  await expect(sheet.getByText(title)).toBeVisible();
});

When("I choose {string} next to the calendar heading", async ({ page }, name: string) => {
  await page.getByRole("main").getByRole("button", { name, exact: true }).click();
});

When("I scroll the page down", async ({ page }) => {
  await page.evaluate("window.scrollTo(0, 300)");
  await expect.poll(() => page.evaluate<number>("window.scrollY")).toBeGreaterThan(0);
});

Then("the days row stays right below the app header", async ({ page }) => {
  const gapBelowHeader = async (): Promise<number> => {
    const header = await page.locator(".og-header").boundingBox();
    const strip = await page.locator(`.${WEEK_STRIP_WRAPPER_CLASS}`).boundingBox();
    if (header === null || strip === null) {
      return Number.NaN;
    }
    return Math.round(strip.y - (header.y + header.height));
  };
  await expect.poll(gapBelowHeader).toBeGreaterThanOrEqual(-1);
  await expect.poll(gapBelowHeader).toBeLessThanOrEqual(1);
});
