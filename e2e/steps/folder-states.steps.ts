// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const FOLDER_LIST_ROUTE = /\/api\/(drives\/[^/]+|files\/[^/]+)\/children(\?.*)?$/;
const FOLDER_DETAILS_ROUTE = /\/api\/files\/[^/?]+$/;
const SLOW_LIST_DELAY_MS = 1500;

const failureSwitches = new WeakMap<Page, Map<string, { failing: boolean }>>();

const failRequestsWhileOn = async (page: Page, pattern: RegExp, kind: string): Promise<void> => {
  const switches = failureSwitches.get(page) ?? new Map<string, { failing: boolean }>();
  failureSwitches.set(page, switches);
  const switchForKind = { failing: true };
  switches.set(kind, switchForKind);
  await page.route(pattern, (route) => (switchForKind.failing ? route.abort() : route.continue()));
};

const retryButtonOf = (page: Page) => page.getByTestId("files-retry");

Given("the folder list of Anna loads slowly", async ({ page }) => {
  await page.route(FOLDER_LIST_ROUTE, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, SLOW_LIST_DELAY_MS));
    await route.continue();
  });
});

Given("the next folder list of Anna fails to load", async ({ page }) => {
  await failRequestsWhileOn(page, FOLDER_LIST_ROUTE, "list");
});

Given("the next folder details of Anna fail to load", async ({ page }) => {
  await failRequestsWhileOn(page, FOLDER_DETAILS_ROUTE, "details");
});

When("Anna chooses Try again", async ({ page }) => {
  for (const switchForKind of failureSwitches.get(page)?.values() ?? []) {
    switchForKind.failing = false;
  }
  await retryButtonOf(page).click();
});

Then("a loading placeholder is shown for the folder", async ({ page }) => {
  const loading = page.getByTestId("files-folder-loading");
  await expect(loading).toBeVisible();
  await expect(loading).toHaveAttribute("role", "status");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAccessibleName("Loading...");
});

Then(/^the folder lists "([^"]*)" once it has loaded$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("files-folder-contents").getByText(name)).toBeVisible();
});

Then("the folder says it could not be loaded and offers to try again", async ({ page }) => {
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(retryButtonOf(page)).toHaveText("Try again");
});

Then(
  "Anna sees the folder not found view with the same text as for a folder that does not exist",
  async ({ page }) => {
    const notFound = page.getByTestId("folder-not-found");
    await expect(notFound).toBeVisible();
    await expect(notFound.getByRole("heading")).toHaveText("Folder not found");
    await expect(notFound).toContainText("This file or folder is no longer available.");
  },
);
