// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "First family";
const WELCOME_HEADING = "Create a Family Space";
const INVITATION_NOTE = "Were you invited? Ask the family organizer to add you.";
const CREATE_FAMILY_PATH = "/welcome";
const HOME_PATH = "/";

const firstFamilyEmail = (world: ScenarioWorld): string => {
  world.signInEmail ??= uniqueEmail("first-family");
  return world.signInEmail;
};

const currentPath = (page: Page): string => new URL(page.url()).pathname;

const registerAndOpenApp = async (page: Page, world: ScenarioWorld): Promise<void> => {
  const registration = await registerAccount(world.api, {
    email: firstFamilyEmail(world),
    displayName: "Anna",
  });
  expect(registration.status).toBe(201);
  const { cookies } = await world.api.storageState();
  await page.context().addCookies(cookies);
  await page.goto(`${webBaseUrl()}/`);
};

const signInThroughForm = async (page: Page, email: string): Promise<void> => {
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-password").fill(STRONG_PASSWORD);
  await page.getByTestId("sign-in-submit").click();
};

const createFamilyThroughForm = async (page: Page, name: string): Promise<void> => {
  await page.getByLabel("Family or Household Name").fill(name);
  await page.getByTestId("create-family-submit").click();
};

const signOutFromHome = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
};

const expectCreateFamilyStep = async (page: Page): Promise<void> => {
  await expect(page.getByRole("heading", { name: WELCOME_HEADING })).toBeVisible();
  await expect.poll(() => currentPath(page)).toBe(CREATE_FAMILY_PATH);
};

Given("I just created my account and have no family", async ({ page, world }) => {
  await registerAndOpenApp(page, world);
  await expectCreateFamilyStep(page);
});

Given("I am on the create-family step", async ({ page }) => {
  await expectCreateFamilyStep(page);
});

Given("I belong to a family named {string}", async ({ page, world }, name: string) => {
  await registerAndOpenApp(page, world);
  await expectCreateFamilyStep(page);
  await createFamilyThroughForm(page, name);
  await expect(page.getByTestId("family-list-item")).toContainText(name);
  await signOutFromHome(page);
});

When("I sign in", async ({ page, world }) => {
  await signInThroughForm(page, firstFamilyEmail(world));
});

When("I enter the family name {string} and continue", async ({ page }, name: string) => {
  await createFamilyThroughForm(page, name);
});

When("I enter an empty family name and continue", async ({ page }) => {
  await createFamilyThroughForm(page, "");
});

When("I reload the page", async ({ page }) => {
  await page.reload();
});

When("I sign out from the create-family step", async ({ page }) => {
  await page.getByTestId("first-family-sign-out").click();
});

Then("I am asked to create my family", async ({ page }) => {
  await expectCreateFamilyStep(page);
  await captureScreen(page, "create family", FEATURE);
});

Then("I am still on the create-family step", async ({ page }) => {
  await expectCreateFamilyStep(page);
});

Then("I land on the home page", async ({ page }) => {
  await expect.poll(() => currentPath(page)).toBe(HOME_PATH);
  await expect(page.getByTestId("family-list-item").first()).toBeVisible();
});

Then("I am a member of {string}", async ({ page }, name: string) => {
  await expect(page.getByTestId("family-list-item")).toContainText(name);
});

Then("I go straight to the home page", async ({ page }) => {
  await expect.poll(() => currentPath(page)).toBe(HOME_PATH);
  await expect(page.getByTestId("family-list-item").first()).toBeVisible();
});

Then("I see a note to ask my family organizer for an invitation", async ({ page }) => {
  await expect(page.getByText(INVITATION_NOTE)).toBeVisible();
  await captureScreen(page, "invitation note", FEATURE);
});

Then("I see the sign in page", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
