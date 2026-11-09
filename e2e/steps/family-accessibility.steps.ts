// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signInThroughUi, type WebAccount } from "../support/web-session.js";
import { webBaseUrl } from "../support/stack.js";
import { blockingViolationDescriptions } from "../support/accessibility.js";

const { When, Then } = createBdd(test);

const FAMILIES_PATH = "/";

const createFamilyLessAccount = async (world: ScenarioWorld): Promise<WebAccount> => {
  const email = uniqueEmail("family-less");
  const registration = await registerAccount(world.api, { email, displayName: "Ben Member" });
  expect(registration.status).toBe(201);
  return { email, password: STRONG_PASSWORD, displayName: "Ben Member" };
};

When("I open the Families screen", async ({ page, world }) => {
  const account = await createFamilyLessAccount(world);
  world.ownAccount = account;
  await signInThroughUi(page, account);
  await page.goto(`${webBaseUrl()}${FAMILIES_PATH}`);
});

Then("the Families screen has no serious accessibility violations", async ({ page }) => {
  expect(await blockingViolationDescriptions(page)).toEqual([]);
});
