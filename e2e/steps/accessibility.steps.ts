// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { runAdminAccount, signInThroughUi } from "../support/web-session.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then } = createBdd(test);

type ScreenRoute = { path: string; signedIn: boolean };

const SCREEN_ROUTES: Record<string, ScreenRoute> = {
  "sign-in": { path: "/sign-in", signedIn: false },
  "create account": { path: "/create-account", signedIn: false },
  "forgot password": { path: "/forgot-password", signedIn: false },
  "reset password": { path: "/reset-password", signedIn: false },
  "account settings": { path: "/settings", signedIn: true },
  "admin settings": { path: "/admin", signedIn: true },
  "app shell": { path: "/apps", signedIn: true },
};

const routeFor = (screen: string): ScreenRoute => {
  const route = SCREEN_ROUTES[screen];
  if (route === undefined) {
    throw new Error(`No route is known for the "${screen}" screen.`);
  }
  return route;
};

const openScreen = async (page: Page, world: ScenarioWorld, route: ScreenRoute): Promise<void> => {
  if (route.signedIn) {
    const admin = await runAdminAccount(world.api);
    world.ownAccount = admin;
    await signInThroughUi(page, admin);
  }
  await page.goto(`${webBaseUrl()}${route.path}`);
};

When("I open the {string} screen", async ({ page, world }, screen: string) => {
  await openScreen(page, world, routeFor(screen));
});

Then("the page has no serious accessibility violations", async ({ page }) => {
  expect(await blockingViolationDescriptions(page)).toEqual([]);
});
