// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { calendarEventSchema } from "@offgrid/contracts";
import { createBdd } from "playwright-bdd";
import { bearer, joinFamilyWithInvitation } from "../support/family-sessions.js";
import { createCalendar } from "../support/factories/calendar.js";
import { createEventWithLocation, inviteGuest } from "../support/factories/calendar-guests.js";
import {
  listOwnNotifications,
  regenerateOwnRecoveryCode,
  signedInPerson,
  waitForOwnNotifications,
} from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { signInThroughUi } from "../support/web-session.js";
import type { SignedInPerson } from "../support/factories/notifications.js";

const { Given, When, Then } = createBdd(test);

const INVITE_SETTLE_TIMEOUT_MS = 5_000;
const INVITE_SETTLE_INTERVAL_MS = 200;

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const tomOf = (world: ScenarioWorld): SignedInPerson => {
  const tom = world.people?.tom;
  if (tom === undefined) {
    throw new Error("Tom is not signed in in this scenario.");
  }
  return tom;
};

const createNoticeForAnna = async (world: ScenarioWorld): Promise<void> => {
  const response = await regenerateOwnRecoveryCode(world.api, annaOf(world));
  expect(response.status(), "Anna could not get a new notice").toBe(201);
};

const inviteOnceShared = async (
  api: APIRequestContext,
  host: SignedInPerson,
  eventId: string,
  guestUserId: string,
): Promise<APIResponse> => {
  const deadline = Date.now() + INVITE_SETTLE_TIMEOUT_MS;
  let response = await inviteGuest(api, host.session, eventId, guestUserId);
  while (response.status() === 400 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, INVITE_SETTLE_INTERVAL_MS));
    response = await inviteGuest(api, host.session, eventId, guestUserId);
  }
  return response;
};

const bellNameFor = (count: number): string =>
  count === 0 ? "Notifications" : `Notifications, ${count} unread`;

Given("Anna belongs to a family of her own", async ({ world }) => {
  const anna = annaOf(world);
  const response = await world.api.post("/api/families", {
    headers: bearer(anna.session),
    data: { name: "Annas family" },
    failOnStatusCode: false,
  });
  expect(response.status(), "Anna could not create her family").toBe(201);
});

Given("Tom and Anna share a family", async ({ world }) => {
  world.people ??= {};
  const anna = annaOf(world);
  const tom = await signedInPerson(world.api, "Tom");
  world.people.tom = tom;
  const response = await world.api.post("/api/families", {
    headers: bearer(anna.session),
    data: { name: "Annas family" },
    failOnStatusCode: false,
  });
  expect(response.status(), "Anna could not create her family").toBe(201);
  const { id: familyId } = (await response.json()) as { id: string };
  await joinFamilyWithInvitation(world.api, anna.session, tom.session, familyId);
});

Given(/^she has (\d+) unread calendar invitations? from Tom$/, async ({ world }, count: string) => {
  const anna = annaOf(world);
  const tom = tomOf(world);
  const calendar = await createCalendar(world.api, tom.session, {
    name: "Tom invitations",
    color: "blue",
  });
  for (let index = 0; index < Number(count); index++) {
    const created = await createEventWithLocation(world.api, tom.session, calendar.id, {
      title: `Invitation ${index + 1}`,
      startsAt: "2026-12-01T09:00:00Z",
      endsAt: "2026-12-01T09:30:00Z",
    });
    expect(created.status(), `Tom could not create invitation ${index + 1}`).toBe(201);
    const { id: eventId } = calendarEventSchema.pick({ id: true }).parse(await created.json());
    const invited = await inviteOnceShared(world.api, tom, eventId, anna.userId);
    expect(invited.status(), `Tom could not invite Anna to invitation ${index + 1}`).toBe(201);
  }
  await waitForOwnNotifications(
    world.api,
    anna.session,
    (list) => list.unreadCount === Number(count),
  );
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
  const anna = annaOf(world);
  await signInThroughUi(page, { email: anna.email, password: anna.password, displayName: "Anna" });
  await expect(page.getByTestId("header-bell")).toBeVisible();
});

When("a new notice arrives for Anna", async ({ world }) => {
  await createNoticeForAnna(world);
});

Then(/^the bell shows (\d+) unread$/, async ({ page }, count: string) => {
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

Then(/^the bell shows 99\+ for (\d+) unread$/, async ({ page }, count: string) => {
  await expect(page.getByTestId("header-bell")).toHaveAccessibleName(bellNameFor(Number(count)));
  await expect(page.getByTestId("header-bell-badge")).toHaveText("99+");
});

Then("the bell shows no unread count", async ({ page }) => {
  await expect(page.getByTestId("header-bell")).toHaveAccessibleName("Notifications");
  await expect(page.getByTestId("header-bell-badge")).toHaveCount(0);
});
