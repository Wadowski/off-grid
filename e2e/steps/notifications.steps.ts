// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  changeOwnPassword,
  listOwnNotifications,
  markOwnNotificationRead,
  regenerateOwnRecoveryCode,
  signedInPerson,
  type SignedInPerson,
} from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-52 follow-up): ${step}`);
};

function personOf(world: ScenarioWorld, key: string): SignedInPerson {
  const person = world.people?.[key];
  if (person === undefined) {
    throw new Error(`${key} is not signed in in this scenario.`);
  }
  return person;
}

Given("Tom has an unread inbox item", async ({ world }) => {
  world.people ??= {};
  const tom = await signedInPerson(world.api, "Tom");
  world.people.tom = tom;
  const response = await regenerateOwnRecoveryCode(world.api, tom);
  expect(response.status()).toBe(201);
  const { body } = await listOwnNotifications(world.api, tom.session);
  expect(body.notifications).toHaveLength(1);
  world.notificationId = body.notifications[0]?.id;
  expect(world.notificationId).toBeDefined();
});

Given("she has an unread inbox item", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await regenerateOwnRecoveryCode(world.api, anna);
  expect(response.status()).toBe(201);
});

Given("a delivery channel is failing", () =>
  notImplemented(
    "a delivery channel is failing: no channel besides the inbox is registered until OG-53",
  ),
);

When("Anna changes her password", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await changeOwnPassword(world.api, anna);
  world.response = { status: response.status(), body: {} };
});

When("Anna marks an item as read", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  const item = body.notifications.find((notification) => notification.readAt === null);
  expect(item, "Anna has no unread item to mark").toBeDefined();
  if (item === undefined) {
    return;
  }
  world.notificationId = item.id;
  const response = await markOwnNotificationRead(world.api, anna.session, item.id);
  expect(response.status()).toBe(204);
});

Then("she has a new unread inbox item saying so", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  expect(body.unreadCount).toBeGreaterThanOrEqual(1);
  expect(body.notifications.map((notification) => notification.type)).toContain("password-changed");
});

Then("it no longer counts as unread", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  const item = body.notifications.find((notification) => notification.id === world.notificationId);
  expect(item?.readAt).not.toBeNull();
  expect(body.unreadCount).toBe(0);
});

Then("Anna cannot see Tom's notifications", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  expect(body.notifications.map((notification) => notification.id)).not.toContain(
    world.notificationId,
  );
  const response = await markOwnNotificationRead(
    world.api,
    anna.session,
    world.notificationId ?? "",
  );
  expect(response.status()).toBe(404);
});

Then("the password change still succeeds", ({ world }) => {
  expect(world.response?.status).toBe(204);
});

Then("the inbox item is still created", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  expect(body.notifications.map((notification) => notification.type)).toContain("password-changed");
});
