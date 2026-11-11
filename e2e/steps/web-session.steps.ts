// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { signInWith } from "../support/factories/instance-admin.js";
import {
  createWebAccount,
  openUserMenu,
  signInThroughUi,
  type WebAccount,
} from "../support/web-session.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const PROTECTED_PATH = "/settings";

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

const signedInWebAccount = async (page: Page, world: ScenarioWorld): Promise<WebAccount> => {
  const account = await createWebAccount(world.api, "Anna Kowalska");
  world.ownAccount = account;
  await signInThroughUi(page, account);
  return account;
};

const endSessionsOnOtherDevice = async (
  world: ScenarioWorld,
  account: WebAccount,
): Promise<void> => {
  const { session } = await signInWith(world.api, account.email, account.password);
  expect(session, "the other device could not sign in").toBeDefined();
  const response = await world.api.post("/api/me/sessions/sign-out-others", {
    headers: { authorization: `Bearer ${session?.accessToken ?? ""}` },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
};

Given("I am not signed in", async ({ world }) => {
  world.ownAccount = await createWebAccount(world.api, "Anna Kowalska");
});

Given("my access has expired but my session is valid", async ({ page, world }) => {
  await signedInWebAccount(page, world);
});

Given("my session was ended elsewhere", async ({ page, world }) => {
  const account = await signedInWebAccount(page, world);
  await endSessionsOnOtherDevice(world, account);
});

When("I open a protected page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}${PROTECTED_PATH}`);
});

When("I open the sign-in page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/sign-in`);
});

When("I use the app", async ({ page }) => {
  await page.reload();
});

When("I choose {string}", async ({ page }, item: string) => {
  await openUserMenu(page);
  await page.getByRole("menuitem", { name: item }).click();
});

Then("I am taken to the home page", async ({ page }) => {
  await page.waitForURL(`${webBaseUrl()}/`);
});

Then("after signing in I land on the page I asked for", async ({ page, world }) => {
  await page.waitForURL(`${webBaseUrl()}/sign-in`);
  await submitSignInForm(page, accountOf(world));
  await page.waitForURL(`${webBaseUrl()}${PROTECTED_PATH}`);
  expect(new URL(page.url()).pathname).toBe(PROTECTED_PATH);
});

Then("I stay signed in without being asked for my password", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Account menu/ })).toBeVisible();
  await expect(page.getByTestId("sign-in-submit")).toHaveCount(0);
});

Then("I am taken to sign-in with the message {string}", async ({ page }, message: string) => {
  await page.waitForURL(`${webBaseUrl()}/sign-in`);
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

When("I open the app", () => {
  throw new Error(
    "The fresh-server scenario needs an instance with no accounts (OG-64 follow-up).",
  );
});

Then("I am taken to the set-up page that creates the first admin account", () => {
  throw new Error(
    "The fresh-server scenario needs an instance with no accounts, which the shared e2e stack never has (OG-64 follow-up).",
  );
});
