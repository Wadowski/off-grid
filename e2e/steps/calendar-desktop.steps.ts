// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { test } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then, Given } = createBdd(test);

const DESKTOP_HEIGHT = 900;
const SIDEBAR = "calendar-sidebar";
const AGENDA_PATHS = ["/calendar", "/calendar/agenda"];

const sidebarCheckbox = (page: Page, name: string) =>
  page.getByTestId(SIDEBAR).getByRole("checkbox", { name, exact: true });

const openAt = async (page: Page, path: string, width: number): Promise<void> => {
  await page.setViewportSize({ width, height: DESKTOP_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

Given("the browser blocks saved preferences", async ({ page }) => {
  // Every read and write of the browser storage throws, as in a private window with blocked site data.
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
  /^the address (?:still )?shows the agenda view for (\d{4}-\d{2}-\d{2})$/,
  async ({ page }, date: string) => {
    const url = new URL(page.url());
    expect(AGENDA_PATHS).toContain(url.pathname);
    expect(url.searchParams.get("date")).toBe(date);
  },
);

When("I choose the week view in the view selector", async ({ page }) => {
  await page.getByRole("combobox", { name: "Calendar view" }).selectOption("week");
  await expect.poll(() => new URL(page.url()).pathname).toBe("/calendar/week");
});

Then("I do not see the event {string} in the week grid", async ({ page }, title: string) => {
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
