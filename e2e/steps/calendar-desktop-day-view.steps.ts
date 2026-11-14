// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { test } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then } = createBdd(test);

const DESKTOP_HEIGHT = 900;
const COMMAND_ROW = "day-command-row";

const commandRow = (page: Page) => page.getByTestId(COMMAND_ROW);

const openAt = async (page: Page, path: string, width: number): Promise<void> => {
  await page.setViewportSize({ width, height: DESKTOP_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

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
