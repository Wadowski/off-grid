// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";
import { captureScreen, screenOptionsFor } from "../support/screenshots.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "Empty, loading and failed states of a folder";
const SCREEN_TAG = "@screen:";

const FOLDER_LIST_ROUTE = /\/api\/(drives\/[^/]+|files\/[^/]+)\/children(\?.*)?$/;
const FOLDER_DETAILS_ROUTE = /\/api\/files\/[^/?]+$/;

const failureSwitches = new WeakMap<Page, Map<string, { failing: boolean }>>();
const heldListRequests = new WeakMap<Page, () => void>();

const failRequestsWhileOn = async (page: Page, pattern: RegExp, kind: string): Promise<void> => {
  const switches = failureSwitches.get(page) ?? new Map<string, { failing: boolean }>();
  failureSwitches.set(page, switches);
  const switchForKind = { failing: true };
  switches.set(kind, switchForKind);
  await page.route(pattern, (route) => (switchForKind.failing ? route.abort() : route.continue()));
};

const holdFolderListUntilReleased = async (page: Page): Promise<void> => {
  const released = new Promise<void>((resolve) => {
    heldListRequests.set(page, resolve);
  });
  await page.route(FOLDER_LIST_ROUTE, async (route) => {
    await released;
    await route.continue();
  });
};

const releaseHeldFolderList = (page: Page): void => {
  heldListRequests.get(page)?.();
};

const retryButtonOf = (page: Page) => page.getByTestId("files-retry");

const captureTaggedScreen = async (page: Page, tags: readonly string[]): Promise<void> => {
  const screenTag = tags.find((tag) => tag.startsWith(SCREEN_TAG));
  if (screenTag === undefined) {
    return;
  }
  await captureScreen(
    page,
    screenTag.slice(SCREEN_TAG.length),
    FEATURE,
    undefined,
    screenOptionsFor(tags),
  );
};

Given("the folder list of Anna loads slowly", async ({ page }) => {
  await holdFolderListUntilReleased(page);
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

Then("a loading placeholder is shown for the folder", async ({ page, $tags }) => {
  const loading = page.getByTestId("files-folder-loading");
  await expect(loading).toBeVisible();
  await expect(loading).toHaveAttribute("role", "status");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAccessibleName("Loading...");
  await captureTaggedScreen(page, $tags);
});

Then(/^the folder lists "([^"]*)" once it has loaded$/, async ({ page }, name: string) => {
  releaseHeldFolderList(page);
  await expect(page.getByTestId("files-folder-contents").getByText(name)).toBeVisible();
});

Then("the folder says it could not be loaded and offers to try again", async ({ page, $tags }) => {
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(retryButtonOf(page)).toHaveText("Try again");
  await captureTaggedScreen(page, $tags);
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
