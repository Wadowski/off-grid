// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { accessWithToken, signInWith } from "../support/factories/instance-admin.js";
import { scenarioClientAddress } from "../support/scenario-client-address.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const NEW_PASSWORD = "amber lantern meadow river 2026";
const WRONG_PASSWORD = "not the right passphrase";
const RENAMED = "Anna Kowalska";
const FAMILY_NAME = "Rostova Family";
const UNAUTHORIZED = 401;
const SETTINGS_PATH = /^\/settings(\/|$)/;

const ownAccountOf = (world: ScenarioWorld) => {
  if (world.ownAccount === undefined) {
    throw new Error("No account has been created for this scenario.");
  }
  return world.ownAccount;
};

const phoneTokenOf = (world: ScenarioWorld): string => {
  const token = ownAccountOf(world).phoneAccessToken;
  if (token === undefined) {
    throw new Error("No second device has signed in for this scenario.");
  }
  return token;
};

const createOwnAccount = async (world: ScenarioWorld) => {
  const email = uniqueEmail("settings");
  const registration = await registerAccount(world.api, {
    email,
    displayName: "Anna",
    password: STRONG_PASSWORD,
  });
  expect(registration.status, "could not create the account").toBe(201);
  world.ownAccount = { email, password: STRONG_PASSWORD, displayName: "Anna" };
  return world.ownAccount;
};

const signInThroughUi = async (page: Page, email: string, password: string): Promise<void> => {
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-password").fill(password);
  await page.getByTestId("sign-in-submit").click();
};

const createFirstFamilyIfAsked = async (page: Page): Promise<void> => {
  const accountMenu = page.getByRole("button", { name: "Account menu" });
  const firstFamilyHeading = page.getByRole("heading", { name: "Create a Family Space" });
  await expect(accountMenu.or(firstFamilyHeading)).toBeVisible();
  if (await accountMenu.isVisible()) {
    return;
  }
  await page.getByTestId("create-family-name").fill(FAMILY_NAME);
  await page.getByTestId("create-family-submit").click();
  await expect(accountMenu).toBeVisible();
};

const signInOnLaptop = async (page: Page, world: ScenarioWorld): Promise<void> => {
  const account = await createOwnAccount(world);
  await page.setExtraHTTPHeaders({ "x-forwarded-for": scenarioClientAddress() });
  await signInThroughUi(page, account.email, account.password);
  await createFirstFamilyIfAsked(page);
};

const pathOf = (page: Page): string => new URL(page.url()).pathname;

const openSettings = async (page: Page): Promise<void> => {
  if (pathOf(page) === "/settings") {
    return;
  }
  if (SETTINGS_PATH.test(pathOf(page))) {
    await page.getByRole("link", { name: "Back to settings" }).click();
  } else {
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Account and security" }).click();
  }
  await page.waitForURL(`${webBaseUrl()}/settings`);
};

const openSettingsSection = async (page: Page, sectionLabel: string): Promise<void> => {
  await openSettings(page);
  await page.getByRole("link", { name: new RegExp(`^${sectionLabel}`) }).click();
};

const fillPasswordForm = async (
  page: Page,
  values: { readonly current: string; readonly next: string; readonly confirmation: string },
): Promise<void> => {
  await page.getByTestId("settings-password-current").fill(values.current);
  await page.getByTestId("settings-password-new").fill(values.next);
  await page.getByTestId("settings-password-confirmation").fill(values.confirmation);
  await page.getByTestId("settings-password-save").click();
};

const deviceRows = (page: Page) => page.getByTestId("settings-device-list").locator("li");

Given("I am signed in", async ({ page, world }) => {
  await signInOnLaptop(page, world);
});

Given("I am signed in on a laptop and a phone", async ({ page, world }) => {
  await signInOnLaptop(page, world);
  const account = ownAccountOf(world);
  const phone = await signInWith(world.api, account.email, account.password);
  expect(phone.status, "the phone could not sign in").toBe(200);
  account.phoneAccessToken = phone.session?.accessToken;
});

When("I open Settings", async ({ page }) => {
  await openSettings(page);
});

Then("I see my name, email and role", async ({ page, world }) => {
  const account = ownAccountOf(world);
  await expect(page.getByText(account.displayName, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(account.email, { exact: true })).toBeVisible();
  await expect(page.getByText(/^(Admin|Member)$/).first()).toBeVisible();
});

When("I change my display name and save", async ({ page, world }) => {
  await openSettingsSection(page, "Profile");
  await page.getByTestId("settings-profile-name").fill(RENAMED);
  await page.getByTestId("settings-profile-save").click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  ownAccountOf(world).displayName = RENAMED;
});

Then("the header and menu show the new name", async ({ page }) => {
  await expect(page.getByText(RENAMED, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("menu").getByText(RENAMED, { exact: true })).toBeVisible();
});

When("I give my current password and a valid new one", async ({ page, world }) => {
  const account = ownAccountOf(world);
  await openSettingsSection(page, "Password");
  await fillPasswordForm(page, {
    current: account.password,
    next: NEW_PASSWORD,
    confirmation: NEW_PASSWORD,
  });
  account.password = NEW_PASSWORD;
});

Then("the page says {string}", async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

Then("my other devices are signed out", async ({ world }) => {
  const response = await accessWithToken(world.api, phoneTokenOf(world));
  expect(response.status()).toBe(UNAUTHORIZED);
});

When("I give a wrong current password", async ({ page }) => {
  await openSettingsSection(page, "Password");
  await fillPasswordForm(page, {
    current: WRONG_PASSWORD,
    next: NEW_PASSWORD,
    confirmation: NEW_PASSWORD,
  });
});

Then("I see an error and nothing changes", async ({ page, world }) => {
  await expect(page.getByText("The current password is not right.", { exact: true })).toBeVisible();
  const account = ownAccountOf(world);
  const stillValid = await signInWith(world.api, account.email, account.password);
  expect(stillValid.status, "the password changed although it was refused").toBe(200);
});

Then("I see both and {string} is marked", async ({ page }, label: string) => {
  await openSettingsSection(page, "Devices and sessions");
  await expect.poll(() => deviceRows(page).count()).toBeGreaterThanOrEqual(2);
  await expect(deviceRows(page).filter({ hasText: label })).toHaveCount(1);
});

When("I choose {string} and confirm", async ({ page }, label: string) => {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("button", { name: "Yes, sign out other devices", exact: true }).click();
});

Then("only this device stays signed in", async ({ page, world }) => {
  await expect(deviceRows(page)).toHaveCount(1);
  const response = await accessWithToken(world.api, phoneTokenOf(world));
  expect(response.status()).toBe(UNAUTHORIZED);
});

When("I confirm my password and generate a new recovery code", async ({ page, world }) => {
  const account = ownAccountOf(world);
  await openSettingsSection(page, "Recovery code");
  await page.getByTestId("settings-recovery-password").fill(account.password);
  await page.getByTestId("settings-recovery-generate").click();
});

Then("I see the code once and can copy or download it", async ({ page }) => {
  await expect(
    page.getByText("Save this code now. It will not be shown again.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("recovery-copy")).toBeVisible();
  await expect(page.getByTestId("recovery-download")).toBeVisible();
});

When("I choose {string} in Settings", async ({ page }, label: string) => {
  await openSettings(page);
  await page.getByRole("button", { name: label, exact: true }).click();
});

Then("I am taken to the sign-in page", async ({ page }) => {
  await page.waitForURL(`${webBaseUrl()}/sign-in`);
});
