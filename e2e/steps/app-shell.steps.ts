// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import {
  createWebAccount,
  openUserMenu,
  runAdminAccount,
  signInThroughUi,
  type WebAccount,
} from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const DESKTOP_HEIGHT = 900;
const PHONE_HEIGHT = 844;
const PHONE_WIDTH = 390;
const SHELL_KEYBOARD_TAB_LIMIT = 40;

const accountOf = (world: ScenarioWorld): WebAccount => {
  if (world.ownAccount === undefined) {
    throw new Error("No web account has been signed in for this scenario.");
  }
  return world.ownAccount;
};

const signedInAs = async (page: Page, world: ScenarioWorld, account: WebAccount): Promise<void> => {
  world.ownAccount = { ...account, email: account.email, password: account.password };
  await signInThroughUi(page, account);
};

const menuOf = (page: Page) => page.getByRole("menu");

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

Given("I am signed in as {string}, a regular member", async ({ page, world }, name: string) => {
  const account = await createWebAccount(world.api, name);
  await signedInAs(page, world, account);
});

Given("I am signed in as the admin", async ({ page, world }) => {
  await signedInAs(page, world, await runAdminAccount(world.api));
});

Given("I am signed in as a regular member", async ({ page, world }) => {
  const account = await createWebAccount(world.api, "Ben Member");
  await signedInAs(page, world, account);
});

Given("a {int} px wide screen", async ({ page }, width: number) => {
  const height = width <= PHONE_WIDTH ? PHONE_HEIGHT : DESKTOP_HEIGHT;
  await page.setViewportSize({ width, height });
});

When("I open the user menu", async ({ page }) => {
  await openUserMenu(page);
});

When("I use only the keyboard", async ({ page }) => {
  const trigger = page.getByRole("button", { name: /Account menu/ });
  for (let press = 0; press < SHELL_KEYBOARD_TAB_LIMIT; press++) {
    if (await isFocused(trigger)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error("The keyboard could not reach the account menu.");
});

When("I choose {string} in the user menu", async ({ page }, item: string) => {
  await openUserMenu(page);
  await menuOf(page).getByRole("menuitem", { name: item }).click();
});

Then("the header shows my initials", async ({ page, world }) => {
  const initials = accountOf(world)
    .displayName.split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  // The initials are drawn by a CSS pseudo-element, so read the rendered content.
  await expect
    .poll(() =>
      page.evaluate(
        `getComputedStyle(document.querySelector(".og-user-menu-avatar"), "::before").content`,
      ),
    )
    .toBe(`"${initials}"`);
});

Then("I see my name, my email and the badge {string}", async ({ page, world }, badge: string) => {
  const account = accountOf(world);
  await expect(menuOf(page)).toContainText(account.displayName);
  await expect(menuOf(page)).toContainText(account.email);
  await expect(menuOf(page)).toContainText(badge);
});

Then("I see {string}", async ({ page }, label: string) => {
  await expect(page.getByRole("menuitem", { name: label })).toBeVisible();
});

Then("I do not see {string}", async ({ page }, label: string) => {
  await expect(page.getByRole("menuitem", { name: label })).toHaveCount(0);
});

Then(
  "the bottom navigation shows {string}, {string} and {string}",
  async ({ page }, first: string, second: string, third: string) => {
    const bar = page.getByTestId("mobile-tab-bar");
    await expect(bar).toBeVisible();
    for (const label of [first, second, third]) {
      await expect(bar.getByText(label, { exact: true })).toBeVisible();
    }
  },
);

When("I tap {string} in the bottom navigation", async ({ page }, item: string) => {
  await page.getByTestId("mobile-tab-bar").getByRole("link", { name: item }).click();
});

Then("I see the list of apps", async ({ page }) => {
  await expect(page.getByTestId("apps-list")).toBeVisible();
});

Then("the sidebar shows {string} and {string}", async ({ page }, first: string, second: string) => {
  for (const label of [first, second]) {
    await expect(page.getByRole("link", { name: new RegExp(label, "i") }).first()).toBeVisible();
  }
});

Then("the sidebar shows my name and the families I belong to", async ({ page, world }) => {
  await expect(page.getByTestId("sidebar-family-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /Account menu/ })).toContainText(
    accountOf(world).displayName,
  );
});

Then("the header shows the title of the page I am on", async ({ page }) => {
  await expect(page.getByRole("banner")).toBeVisible();
});

Then(
  "I can reach the navigation and the user menu and close the menu with Escape",
  async ({ page }) => {
    await expect(
      page.getByTestId("app-nav").or(page.getByTestId("mobile-tab-bar")).first(),
    ).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(menuOf(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuOf(page)).toHaveCount(0);
  },
);

Then("I am signed out", async ({ page }) => {
  await expect(page.getByTestId("sign-in-submit")).toBeVisible();
});
