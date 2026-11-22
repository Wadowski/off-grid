// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Locator, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import type { SignedInPerson } from "../support/factories/notifications.js";
import { signInThroughUi } from "../support/web-session.js";

const { When, Then } = createBdd(test);

const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const MODAL_TEST_ID = "notifications-modal";

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const modalOf = (page: Page): Locator => page.getByTestId(MODAL_TEST_ID);

const filterChipOf = (page: Page, label: string): Locator =>
  modalOf(page)
    .getByTestId("notifications-filter-bar")
    .getByRole("button", { name: new RegExp(`^${label}`) });

const quotedNames = (text: string): string[] =>
  Array.from(text.matchAll(/"([^"]+)"/g), (match) => match[1] ?? "");

const openModalOnPhone = async (page: Page, anna: SignedInPerson): Promise<void> => {
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.getByTestId("header-bell").click();
  await expect(modalOf(page)).toBeVisible();
};

When("Anna opens the notifications modal from the bell on a phone", async ({ page, world }) => {
  await openModalOnPhone(page, annaOf(world));
});

Then("the modal tells her she is all caught up", async ({ page }) => {
  await expect(modalOf(page).getByTestId("notifications-empty-state")).toBeVisible();
  await expect(modalOf(page).getByTestId("notification-card")).toHaveCount(0);
});

Then("the modal lists her latest notices", async ({ page }) => {
  await expect(modalOf(page).getByTestId("notification-card").first()).toBeVisible();
});

Then(/^the modal offers the filters (.+)$/, async ({ page }, labels: string) => {
  for (const label of quotedNames(labels)) {
    await expect(filterChipOf(page, label)).toBeVisible();
  }
});

When(/^Anna selects the "([^"]+)" filter in the modal$/, async ({ page }, label: string) => {
  await filterChipOf(page, label).click();
});

Then("only the calendar notice is listed in the modal", async ({ page }) => {
  await expect(modalOf(page).getByTestId("notification-card")).toHaveCount(1);
});

When("Anna marks all notices as read in the modal", async ({ page }) => {
  await modalOf(page).getByTestId("notifications-mark-all-read").click();
});

Then("the modal shows no unread notices", async ({ page }) => {
  await expect(modalOf(page).getByTestId("notification-card-unread-dot")).toHaveCount(0);
});

When("Anna chooses to view all notifications from the modal", async ({ page }) => {
  await modalOf(page).getByTestId("notifications-modal-view-all").click();
});

Then("the full notifications page is shown", async ({ page }) => {
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByTestId("notifications-page")).toBeVisible();
});

When("Anna closes the modal with its close button", async ({ page }) => {
  await modalOf(page).getByTestId("notifications-modal-close").click();
});

When("Anna presses Escape", async ({ page }) => {
  await page.keyboard.press("Escape");
});

Then("the notifications modal is closed", async ({ page }) => {
  await expect(modalOf(page)).toHaveCount(0);
});
