// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const DIALOG_TIMEOUT_MS = 10_000;

const newFolderTriggerOf = (page: Page): Locator =>
  page.getByTestId("files-new-folder-button").or(page.getByTestId("files-top-bar-new-folder"));

const dialogOf = (page: Page): Locator => page.getByTestId("new-folder-dialog");

const nameFieldOf = (page: Page): Locator => page.getByTestId("new-folder-name");

const submitWithName = async (page: Page, name: string): Promise<void> => {
  await nameFieldOf(page).fill(name);
  await page.getByTestId("new-folder-submit").click();
};

When("Anna chooses New folder", async ({ page }) => {
  await newFolderTriggerOf(page).click();
});

When(
  /^Anna creates the folder "([^"]*)" from the New folder dialog$/,
  async ({ page }, name: string) => {
    await submitWithName(page, name);
  },
);

When(
  /^Anna submits the New folder dialog with the name "([^"]*)"$/,
  async ({ page }, name: string) => {
    await submitWithName(page, name);
  },
);

When(/^Anna types "([^"]*)" in the New folder dialog$/, async ({ page }, name: string) => {
  await nameFieldOf(page).fill(name);
});

When("Anna chooses Cancel in the New folder dialog", async ({ page }) => {
  await page.getByTestId("new-folder-cancel").click();
});

When("Anna presses Escape in the New folder dialog", async ({ page }) => {
  await page.keyboard.press("Escape");
});

Then("the New folder dialog is open", async ({ page }) => {
  await expect(dialogOf(page)).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});

Then("the New folder dialog has its name field focused", async ({ page }) => {
  await expect(nameFieldOf(page)).toBeFocused({ timeout: DIALOG_TIMEOUT_MS });
});

Then("the New folder dialog is closed", async ({ page }) => {
  await expect(dialogOf(page)).toHaveCount(0, { timeout: DIALOG_TIMEOUT_MS });
});

Then(/^the New folder dialog shows "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(dialogOf(page).getByText(message, { exact: true })).toBeVisible({
    timeout: DIALOG_TIMEOUT_MS,
  });
});

Then(/^the table does not list the folder "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(
    page.getByRole("table", { name: "Folder contents" }).getByText(name, { exact: true }),
  ).toHaveCount(0);
});

Then(/^the phone list shows the folder "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(
    page.getByTestId("files-list").getByTestId("file-row").filter({ hasText: name }),
  ).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});
