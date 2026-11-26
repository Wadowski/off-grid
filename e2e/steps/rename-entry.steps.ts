// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const LONG_NAME_LENGTH = 256;
const MENU_ENTRY_ROWS =
  '[data-testid="file-table-row"], [data-testid="file-row"], [data-testid="file-card"]';

const entryNamed = (page: Page, name: string): Locator =>
  page.locator(MENU_ENTRY_ROWS).filter({ has: page.getByText(name, { exact: true }) });

const actionsTriggerOf = (page: Page, name: string): Locator =>
  entryNamed(page, name).getByTestId("file-actions-trigger");

const renameDialog = (page: Page): Locator => page.getByTestId("rename-entry-dialog");

const nameField = (page: Page): Locator => page.getByTestId("rename-entry-name");

const submitWithName = async (page: Page, name: string): Promise<void> => {
  await nameField(page).fill(name);
  await page.getByTestId("rename-entry-submit").click();
};

When("Anna chooses Rename from the actions menu", async ({ page }) => {
  await page.getByRole("menu").getByTestId("file-action-rename").click();
});

When(/^Anna types "([^"]*)" as the new name$/, async ({ page }, name: string) => {
  await nameField(page).fill(name);
});

When("Anna types a 256 character name as the new name", async ({ page }) => {
  await nameField(page).fill("a".repeat(LONG_NAME_LENGTH));
});

When("Anna submits the rename", async ({ page }) => {
  await page.getByTestId("rename-entry-submit").click();
});

When("Anna cancels the rename", async ({ page }) => {
  await page.getByTestId("rename-entry-cancel").click();
});

const renameFromMenu = async (page: Page, name: string, newName: string): Promise<void> => {
  await actionsTriggerOf(page, name).click();
  await page.getByRole("menu").getByTestId("file-action-rename").click();
  await submitWithName(page, newName);
};

When(
  /^Anna renames the file "([^"]*)" to "([^"]*)"(?: from its actions menu)?$/,
  async ({ page }, name: string, newName: string) => {
    await renameFromMenu(page, name, newName);
  },
);

When(
  /^Anna renames the folder "([^"]*)" from its actions menu to "([^"]*)"$/,
  async ({ page }, name: string, newName: string) => {
    await renameFromMenu(page, name, newName);
  },
);

Then("the rename dialog shows the name {string}", async ({ page }, name: string) => {
  await expect(nameField(page)).toHaveValue(name);
});

Then("the name field of the rename dialog has focus", async ({ page }) => {
  await expect(nameField(page)).toBeFocused();
});

Then("the rename dialog is closed", async ({ page }) => {
  await expect(renameDialog(page)).toHaveCount(0);
});

Then("the rename dialog is still open", async ({ page }) => {
  await expect(renameDialog(page)).toBeVisible();
});

Then(/^the name field of the rename dialog holds "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(nameField(page)).toHaveValue(name);
});

Then(/^the rename dialog shows the error "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(renameDialog(page).getByRole("alert")).toContainText(message);
});
