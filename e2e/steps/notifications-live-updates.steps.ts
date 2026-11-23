// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { createCalendar } from "../support/factories/calendar.js";
import {
  createEventReminderNotice,
  createPasswordChangeNotice,
} from "../support/factories/notifications.js";
import type { SignedInPerson } from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { expectNoticeOnOpenPage, markPageLoadedOnce } from "../support/notices-on-page.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi } from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const NOTIFICATIONS_PATH = "/notifications";
const PASSWORD_CHANGED_TITLE = "Your password was changed";
const REMINDER_CALENDAR_NAME = "Reminders";
const REMINDER_TITLE = "Stand-up";

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

Given("she has the notifications page open", async ({ page, world }) => {
  const anna = annaOf(world);
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await page.goto(`${webBaseUrl()}${NOTIFICATIONS_PATH}`);
  await expect(page.getByTestId("notifications-page")).toBeVisible();
  await markPageLoadedOnce(page);
});

Given("she has a calendar reminder from today", async ({ world }) => {
  const anna = annaOf(world);
  const calendar = await createCalendar(world.api, anna.session, {
    name: REMINDER_CALENDAR_NAME,
    color: "blue",
  });
  await createEventReminderNotice(world.api, anna, {
    calendarId: calendar.id,
    title: REMINDER_TITLE,
  });
});

When("a password change notice is created for Anna", async ({ world }) => {
  await createPasswordChangeNotice(world.api, annaOf(world));
});

Then("the notice appears in her inbox without reloading the page", async ({ page }) => {
  await expectNoticeOnOpenPage(page, PASSWORD_CHANGED_TITLE);
});
