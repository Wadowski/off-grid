// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { bearer } from "../support/family-sessions.js";
import {
  listOwnNotifications,
  regenerateOwnRecoveryCode,
} from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { signInThroughUi } from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const ANNA_FAMILY_NAME = "Annas family";

const annaOf = (world: ScenarioWorld) => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const createNoticeForAnna = async (world: ScenarioWorld): Promise<void> => {
  const response = await regenerateOwnRecoveryCode(world.api, annaOf(world));
  expect(response.status(), "Anna could not get a new notice").toBe(201);
};

const openAppAsAnna = async (page: Parameters<typeof signInThroughUi>[0], world: ScenarioWorld) => {
  const anna = annaOf(world);
  const bell = page.getByTestId("header-bell");
  if (await bell.count()) {
    return;
  }
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await expect(bell).toBeVisible();
};

const bellNameFor = (count: number): string =>
  count === 0 ? "Notifications" : `Notifications, ${count} unread`;

Given("Anna belongs to a family", async ({ world }) => {
  const response = await world.api.post("/api/families", {
    headers: bearer(annaOf(world).session),
    data: { name: ANNA_FAMILY_NAME },
    failOnStatusCode: false,
  });
  expect(response.status(), "Anna could not create her family").toBe(201);
});

Given(/^she has (\d+) unread inbox items$/, async ({ world }, count: string) => {
  for (let created = 0; created < Number(count); created++) {
    await createNoticeForAnna(world);
  }
});

Given("she has no unread inbox items", async ({ world }) => {
  const { body } = await listOwnNotifications(world.api, annaOf(world).session);
  expect(body.unreadCount).toBe(0);
});

Given("she has the app open", async ({ page, world }) => {
  await openAppAsAnna(page, world);
});

When("a recovery code notice is created for Anna", async ({ world }) => {
  await createNoticeForAnna(world);
});

Then(/^the bell shows (\d+) unread$/, async ({ page, world }, count: string) => {
  await openAppAsAnna(page, world);
  await expect(page.getByTestId("header-bell")).toHaveAccessibleName(bellNameFor(Number(count)));
  await expect(page.getByTestId("header-bell-badge")).toHaveText(String(count));
});

Then(
  /^the bell shows (\d+) unread without reloading the page$/,
  async ({ page }, count: string) => {
    await expect(page.getByTestId("header-bell")).toHaveAccessibleName(bellNameFor(Number(count)));
    await expect(page.getByTestId("header-bell-badge")).toHaveText(String(count));
  },
);

Then("the bell shows no unread count", async ({ page, world }) => {
  await openAppAsAnna(page, world);
  await expect(page.getByTestId("header-bell")).toHaveAccessibleName("Notifications");
  await expect(page.getByTestId("header-bell-badge")).toHaveCount(0);
});
