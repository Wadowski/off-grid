// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then } = createBdd(test);

const FEATURE = "calendar-event-modal";
const CALENDAR_PATH = "/calendar";
const EVENT_PATH = "/calendar/event/new";
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 375, height: 812 };
const PHONE_WIDTH_PX = 375;
const MARKER = "__ogPageMarker";

const pathOf = (page: Page): string => new URL(page.url()).pathname;

const modal = (page: Page) => page.getByTestId("new-event-modal");

const todayIso = (): string => new Date().toISOString().slice(0, 10);

// Opens the modal from the desktop calendar sidebar, the way a person does.
const openFromSidebar = async (page: Page): Promise<void> => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(`${webBaseUrl()}${CALENDAR_PATH}`);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await expect.poll(() => pathOf(page)).toBe(EVENT_PATH);
  await expect(modal(page)).toBeVisible();
};

const fillTimes = async (
  page: Page,
  times: { startTime: string; endTime: string },
): Promise<void> => {
  const today = todayIso();
  await page.getByLabel("Start date", { exact: true }).fill(today);
  await page.getByLabel("Start time", { exact: true }).fill(times.startTime);
  await page.getByLabel("End date", { exact: true }).fill(today);
  await page.getByLabel("End time", { exact: true }).fill(times.endTime);
};

When(
  "I open the new event modal from the calendar sidebar on a desktop screen",
  async ({ page }) => {
    await openFromSidebar(page);
  },
);

Then("I see the new event modal over the calendar", async ({ page }) => {
  await expect(modal(page)).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Calendar view", exact: true })).toBeVisible();
  await captureScreen(page, "new event", FEATURE);
});

When(
  "I open the new event modal from the calendar footer at a phone width of 375 pixels",
  async ({ page }) => {
    await page.setViewportSize(PHONE_VIEWPORT);
    await page.goto(`${webBaseUrl()}${CALENDAR_PATH}`);
    await page.getByRole("button", { name: "New Event", exact: true }).click();
    await expect.poll(() => pathOf(page)).toBe(EVENT_PATH);
  },
);

Then("I see the new event modal at phone width", async ({ page }) => {
  await expect(modal(page)).toBeVisible();
  const box = await modal(page).boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(PHONE_WIDTH_PX - 1);
});

When(
  "I type {string} as the event title and close the new event modal without saving",
  async ({ page }, title: string) => {
    await openFromSidebar(page);
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect.poll(() => pathOf(page)).toBe(CALENDAR_PATH);
    await expect(modal(page)).toHaveCount(0);
  },
);

Then("no event named {string} is listed", async ({ page }, title: string) => {
  await expect(page.getByRole("combobox", { name: "Calendar view", exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});

When(
  "I create a timed event named {string} on the calendar {string} from the new event modal",
  async ({ page }, title: string, calendarName: string) => {
    await openFromSidebar(page);
    await page.getByLabel("Title", { exact: true }).fill(title);
    await modal(page).locator("select").selectOption({ label: calendarName });
    await fillTimes(page, { startTime: "09:00", endTime: "10:00" });
    // A page reload would clear this marker, so it shows the agenda updated without one.
    await page.evaluate((key) => {
      (globalThis as unknown as Record<string, unknown>)[key] = "kept";
    }, MARKER);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => pathOf(page)).toBe(CALENDAR_PATH);
    await expect(modal(page)).toHaveCount(0);
  },
);

Then(
  "I see the event {string} in the agenda without reloading the page",
  async ({ page }, title: string) => {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    const marker = await page.evaluate(
      (key) => (globalThis as unknown as Record<string, unknown>)[key],
      MARKER,
    );
    expect(marker).toBe("kept");
  },
);

When("I open the new event address directly", async ({ page }) => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(`${webBaseUrl()}${EVENT_PATH}`);
});

Then("I see the new event modal over the agenda view", async ({ page }) => {
  await expect(modal(page)).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Calendar view", exact: true })).toHaveValue(
    "agenda",
  );
});

When(
  "I try to save an event named {string} that ends before it starts",
  async ({ page }, title: string) => {
    await openFromSidebar(page);
    await page.getByLabel("Title", { exact: true }).fill(title);
    await fillTimes(page, { startTime: "12:00", endTime: "10:00" });
    await page.getByRole("button", { name: "Save", exact: true }).click();
  },
);
