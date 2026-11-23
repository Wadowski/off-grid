// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Locator, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import type { SignedInPerson } from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi } from "../support/web-session.js";

const { When, Then } = createBdd(test);

const NOTIFICATIONS_PATH = "/notifications";
const NOTIFICATIONS_PAGE_TEST_ID = "notifications-page";
const NOTICE_CARD_TEST_ID = "notification-card";
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 375, height: 812 };
const PHONE_MAX_WIDTH = 767;
const DESKTOP_FEATURE = "Notifications page on a desktop";
const PHONE_FEATURE = "Notifications page on a phone";
const PAGE_NAME = "notifications page";

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const pageOf = (page: Page): Locator => page.getByTestId(NOTIFICATIONS_PAGE_TEST_ID);

const featureFor = (page: Page): string =>
  (page.viewportSize()?.width ?? DESKTOP_VIEWPORT.width) > PHONE_MAX_WIDTH
    ? DESKTOP_FEATURE
    : PHONE_FEATURE;

const openNotificationsPage = async (
  page: Page,
  anna: SignedInPerson,
  viewport: { width: number; height: number },
): Promise<void> => {
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await page.setViewportSize(viewport);
  await page.goto(`${webBaseUrl()}${NOTIFICATIONS_PATH}`);
  await expect(pageOf(page)).toBeVisible();
};

When("Anna opens the notifications page on a desktop screen", async ({ page, world }) => {
  await openNotificationsPage(page, annaOf(world), DESKTOP_VIEWPORT);
});

When("Anna opens the notifications page on a phone", async ({ page, world }) => {
  await openNotificationsPage(page, annaOf(world), PHONE_VIEWPORT);
});

Then(/^the notifications page lists her (\d+) notices$/, async ({ page }, count: string) => {
  await expect(pageOf(page).getByTestId(NOTICE_CARD_TEST_ID)).toHaveCount(Number(count));
  await captureScreen(page, PAGE_NAME, featureFor(page));
});
