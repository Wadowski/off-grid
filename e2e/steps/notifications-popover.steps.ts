// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Locator, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { captureScreen } from "../support/screenshots.js";
import type { SignedInPerson } from "../support/factories/notifications.js";
import { signInThroughUi } from "../support/web-session.js";

const { When, Then } = createBdd(test);

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;
const FEATURE = "Notifications popover on a desktop";
const POPOVER_TEST_ID = "notifications-popover";
const PASSWORD_CHANGED_TITLE = "Your password was changed";
const OUTSIDE_POINT = { x: 20, y: 400 };
const FILTER_LIST_PATTERN = /^("[^"]+"(?:(?:, | and )"[^"]+")*)$/;

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const popoverOf = (page: Page): Locator => page.getByTestId(POPOVER_TEST_ID);

const filterChipOf = (page: Page, label: string): Locator =>
  popoverOf(page)
    .getByTestId("notifications-filter-bar")
    .getByRole("button", { name: new RegExp(`^${label}`) });

const quotedNames = (text: string): string[] =>
  Array.from(text.matchAll(/"([^"]+)"/g), (match) => match[1] ?? "");

const reopenPopover = async (page: Page): Promise<void> => {
  if ((await popoverOf(page).count()) === 0) {
    await page.getByTestId("header-bell").click();
  }
};

const openPopoverOnDesktop = async (page: Page, anna: SignedInPerson): Promise<void> => {
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
  await page.getByTestId("header-bell").click();
  await expect(popoverOf(page)).toBeVisible();
};

When(
  "Anna opens the notifications popover from the bell on a desktop screen",
  async ({ page, world }) => {
    await openPopoverOnDesktop(page, annaOf(world));
  },
);

Then(
  /^the notifications popover lists her (\d+) latest notices$/,
  async ({ page }, count: string) => {
    await expect(popoverOf(page).getByTestId("notification-card")).toHaveCount(Number(count));
    await captureScreen(page, "notifications popover", FEATURE, () => reopenPopover(page));
  },
);

Then(/^the notifications popover offers the filters (.+)$/, async ({ page }, labels: string) => {
  expect(labels).toMatch(FILTER_LIST_PATTERN);
  for (const label of quotedNames(labels)) {
    await expect(filterChipOf(page, label)).toBeVisible();
  }
});

When(
  /^Anna selects the "([^"]+)" filter in the notifications popover$/,
  async ({ page }, label: string) => {
    await filterChipOf(page, label).click();
  },
);

Then("only the calendar notice is listed in the notifications popover", async ({ page }) => {
  await expect(popoverOf(page).getByTestId("notification-card")).toHaveCount(1);
});

Then("the password change notice is not listed in the notifications popover", async ({ page }) => {
  await expect(popoverOf(page).getByText(PASSWORD_CHANGED_TITLE)).toHaveCount(0);
});

When("Anna marks all notices as read in the notifications popover", async ({ page }) => {
  await popoverOf(page).getByTestId("notifications-mark-all-read").click();
});

Then("the notifications popover shows no unread notices", async ({ page }) => {
  await expect(popoverOf(page).getByTestId("notification-card-unread-dot")).toHaveCount(0);
});

Then("the notifications popover tells her she is all caught up", async ({ page }) => {
  await expect(popoverOf(page).getByTestId("notifications-empty-state")).toBeVisible();
  await expect(popoverOf(page).getByTestId("notification-card")).toHaveCount(0);
  await captureScreen(page, "notifications popover empty", FEATURE, () => reopenPopover(page));
});

When("Anna chooses to view all notifications from the notifications popover", async ({ page }) => {
  await popoverOf(page).getByTestId("notifications-popover-view-all").click();
});

When("Anna dismisses the notifications popover with the Escape key", async ({ page }) => {
  await page.keyboard.press("Escape");
});

When("Anna clicks outside the notifications popover", async ({ page }) => {
  await page.mouse.click(OUTSIDE_POINT.x, OUTSIDE_POINT.y);
});

Then("the notifications popover is closed", async ({ page }) => {
  await expect(popoverOf(page)).toHaveCount(0);
});

Then("the bell has focus", async ({ page }) => {
  await expect(page.getByTestId("header-bell")).toBeFocused();
});
