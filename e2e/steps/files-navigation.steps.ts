// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";
import type { WebAccount } from "../support/web-session.js";

const { When, Then } = createBdd(test);

const FILES_PATH = "/files";
const SIGN_IN_PATH = "/sign-in";

const accountOf = (world: ScenarioWorld): WebAccount => {
  if (world.ownAccount === undefined) {
    throw new Error("No web account has been created for this scenario.");
  }
  return world.ownAccount;
};

const submitSignInForm = async (page: Page, account: WebAccount): Promise<void> => {
  await page.getByTestId("sign-in-email").fill(account.email);
  await page.getByTestId("sign-in-password").fill(account.password);
  await page.getByTestId("sign-in-submit").click();
};

When("I open Files from the navigation", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/`);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Files" })
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(FILES_PATH);
});

When("I open {string} from the Apps list", async ({ page }, label: string) => {
  await page.getByTestId("apps-list").getByRole("link", { name: label }).click();
});

When("I open the Files page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}${FILES_PATH}`);
});

Then("I see the Files page", async ({ page }) => {
  await expect(page.getByTestId("files-page")).toBeVisible();
});

Then("I see the Files heading", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Files", exact: true })).toBeVisible();
});

Then("the sidebar marks {string} as the current page", async ({ page }, label: string) => {
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: label }),
  ).toHaveAttribute("aria-current", "page");
});

Then("after signing in I land on the Files page", async ({ page, world }) => {
  await page.waitForURL(`${webBaseUrl()}${SIGN_IN_PATH}`);
  await submitSignInForm(page, accountOf(world));
  await page.waitForURL(`${webBaseUrl()}${FILES_PATH}`);
  expect(new URL(page.url()).pathname).toBe(FILES_PATH);
});
