// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const TOP_BAR_TIMEOUT_MS = 10_000;
const KEYBOARD_TAB_LIMIT = 60;

const ACTION_TEST_IDS: Readonly<Record<string, string>> = {
  Upload: "files-top-bar-upload",
  "New folder": "files-top-bar-new-folder",
};

const actionOf = (page: Page, name: string): Locator => {
  const testId = ACTION_TEST_IDS[name];
  if (testId === undefined) {
    throw new Error(`The top row has no action named ${name}.`);
  }
  return page.getByTestId(testId);
};

const isFocused = (locator: Locator): Promise<boolean> =>
  locator.evaluate((element) => element === element.ownerDocument.activeElement);

Then(/^the top row shows the active drive "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("files-top-bar-drive-name")).toHaveText(name, {
    timeout: TOP_BAR_TIMEOUT_MS,
  });
});

Then('the top row shows the actions "Upload" and "New folder"', async ({ page }) => {
  await expect(page.getByTestId("files-top-bar-upload")).toBeVisible({
    timeout: TOP_BAR_TIMEOUT_MS,
  });
  await expect(page.getByTestId("files-top-bar-new-folder")).toBeVisible();
});

Then("the top row is not shown", async ({ page }) => {
  await expect(page.getByTestId("files-top-bar")).toHaveCount(0);
  await expect(page.getByTestId("files-top-bar-drive-control")).toHaveCount(0);
});

Then(/^the action "([^"]*)" is disabled$/, async ({ page }, name: string) => {
  await expect(actionOf(page, name)).toBeDisabled({ timeout: TOP_BAR_TIMEOUT_MS });
});

Then(/^the action "([^"]*)" is enabled$/, async ({ page }, name: string) => {
  await expect(actionOf(page, name)).toBeEnabled({ timeout: TOP_BAR_TIMEOUT_MS });
});

When(
  "Anna reaches the active drive on the phone with the keyboard and presses Enter",
  async ({ page }) => {
    const control = page.getByTestId("files-top-bar-drive-control");
    for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
      if (await isFocused(control)) {
        await page.keyboard.press("Enter");
        return;
      }
      await page.keyboard.press("Tab");
    }
    throw new Error("The keyboard could not reach the active drive on the top row.");
  },
);
