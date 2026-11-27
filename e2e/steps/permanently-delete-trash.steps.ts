// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const purgeButtonNamed = (page: Page, name: string): Locator =>
  page.getByRole("button", { name: `Delete permanently: ${name}`, exact: true });

const purgeDialog = (page: Page): Locator => page.getByTestId("purge-dialog");

const emptyTrashDialog = (page: Page): Locator => page.getByTestId("empty-trash-dialog");

When(/^Anna asks to delete "([^"]*)" permanently$/, async ({ page }, name: string) => {
  await purgeButtonNamed(page, name).click();
  await expect(purgeDialog(page)).toBeVisible();
});

When("Anna confirms deleting permanently", async ({ page }) => {
  await page.getByTestId("purge-confirm").click();
});

When("Anna cancels deleting permanently", async ({ page }) => {
  await page.getByTestId("purge-cancel").click();
});

When("Anna asks to empty the trash", async ({ page }) => {
  await page.getByTestId("trash-empty-button").click();
  await expect(emptyTrashDialog(page)).toBeVisible();
});

When("Anna confirms emptying the trash", async ({ page }) => {
  await page.getByTestId("empty-trash-confirm").click();
});

When("Anna cancels emptying the trash", async ({ page }) => {
  await page.getByTestId("empty-trash-cancel").click();
});

Then("the purge dialog is open", async ({ page }) => {
  await expect(purgeDialog(page)).toBeVisible();
});

Then("the empty trash dialog is open", async ({ page }) => {
  await expect(emptyTrashDialog(page)).toBeVisible();
});

Then(
  /^the purge dialog names "([^"]*)" and says it can't be undone$/,
  async ({ page }, name: string) => {
    await expect(purgeDialog(page)).toContainText(`"${name}"`);
    await expect(purgeDialog(page)).toContainText("This can't be undone.");
  },
);

Then(
  /^the purge dialog says everything inside "([^"]*)" is deleted too$/,
  async ({ page }, name: string) => {
    await expect(purgeDialog(page)).toContainText(`the folder "${name}" and everything in it`);
  },
);

Then(
  "the purge dialog says items in the trash are removed automatically after 30 days",
  async ({ page }) => {
    await expect(purgeDialog(page)).toContainText(
      "Items in the trash are also removed automatically after 30 days.",
    );
  },
);

Then(/^the purge dialog is labelled "([^"]*)"$/, async ({ page }, title: string) => {
  await expect(page.getByRole("dialog", { name: title })).toBeVisible();
});

Then(/^the purge dialog shows the error "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(page.getByTestId("purge-error")).toHaveText(message);
});

Then(
  /^the empty trash dialog says everything in the trash of this drive will be deleted permanently$/,
  async ({ page }) => {
    await expect(emptyTrashDialog(page)).toContainText(
      "Everything in the trash of this drive will be deleted permanently.",
    );
    await expect(emptyTrashDialog(page)).toContainText(
      "Items in the trash are also removed automatically after 30 days.",
    );
  },
);

Then("the trash view does not offer to empty the trash", async ({ page }) => {
  await expect(page.getByTestId("trash-empty-button")).toHaveCount(0);
});
