// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { NEW_PASSWORD } from "../support/factories/instance-admin.js";
import {
  changeOwnPassword,
  listOwnNotifications,
  markAllOwnNotificationsRead,
  markOwnNotificationRead,
  regenerateOwnRecoveryCode,
  signedInPerson,
  waitForOwnNotifications,
  type SignedInPerson,
} from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

function personOf(world: ScenarioWorld, key: string): SignedInPerson {
  const person = world.people?.[key];
  if (person === undefined) {
    throw new Error(`${key} is not signed in in this scenario.`);
  }
  return person;
}

const INBOX_FILTERS: Record<string, NonNullable<Parameters<typeof listOwnNotifications>[2]>> = {
  "the account-security category": { category: "account-security" },
  "the calendar category": { category: "calendar" },
  "unread notices only": { unread: "true" },
  "the calendar category and unread": { category: "calendar", unread: "true" },
};

const filterNamed = (text: string) => {
  const query = INBOX_FILTERS[text];
  if (query === undefined) {
    throw new Error(`"${text}" is not an inbox filter.`);
  }
  return query;
};

const listingOf = (world: ScenarioWorld) => {
  const list = world.notificationList;
  if (list === undefined) {
    throw new Error("Anna has not opened her inbox in this scenario.");
  }
  return list;
};

Given("she has a password change notice", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await changeOwnPassword(world.api, anna);
  expect(response.ok(), "Anna could not change her password").toBe(true);
  anna.password = NEW_PASSWORD;
  await waitForOwnNotifications(world.api, anna.session, (list) =>
    list.notifications.some((notification) => notification.type === "password-changed"),
  );
});

Given("she has a recovery code notice", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await regenerateOwnRecoveryCode(world.api, anna);
  expect(response.status()).toBe(201);
  await waitForOwnNotifications(world.api, anna.session, (list) =>
    list.notifications.some((notification) => notification.type === "recovery-code-regenerated"),
  );
});

Given("she has marked her password change notice as read", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await waitForOwnNotifications(world.api, anna.session, (list) =>
    list.notifications.some((notification) => notification.type === "password-changed"),
  );
  const item = body.notifications.find((notification) => notification.type === "password-changed");
  expect(item, "Anna has no password change notice").toBeDefined();
  const response = await markOwnNotificationRead(world.api, anna.session, item?.id ?? "");
  expect(response.status()).toBe(204);
});

When("Anna opens her inbox", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  world.notificationList = body;
});

When(/^Anna filters her inbox by (.+)$/, async ({ world }, filter: string) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session, filterNamed(filter));
  world.notificationList = body;
});

Then(/^each notice shows the category (.+)$/, ({ world }, category: string) => {
  const notices = listingOf(world).notifications;
  expect(notices.length).toBeGreaterThan(0);
  for (const notice of notices) {
    expect(notice.category).toBe(category);
  }
});

Then(/^she sees (\d+) notices$/, ({ world }, count: string) => {
  expect(listingOf(world).notifications).toHaveLength(Number(count));
});

Then(/^the total is (\d+)$/, ({ world }, total: string) => {
  expect(listingOf(world).total).toBe(Number(total));
});

Then(/^her unread count for the bell is still (\d+)$/, ({ world }, unread: string) => {
  expect(listingOf(world).unreadCount).toBe(Number(unread));
});

Given("Tom has an unread inbox item", async ({ world }) => {
  world.people ??= {};
  const tom = await signedInPerson(world.api, "Tom");
  world.people.tom = tom;
  const response = await regenerateOwnRecoveryCode(world.api, tom);
  expect(response.status()).toBe(201);
  const { body } = await waitForOwnNotifications(
    world.api,
    tom.session,
    (list) => list.notifications.length === 1,
  );
  expect(body.notifications).toHaveLength(1);
  world.notificationId = body.notifications[0]?.id;
  expect(world.notificationId).toBeDefined();
});

Given("she has an unread inbox item", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await regenerateOwnRecoveryCode(world.api, anna);
  expect(response.status()).toBe(201);
});

When("Anna changes her password", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await changeOwnPassword(world.api, anna);
  world.response = { status: response.status(), body: {} };
});

When("Anna marks an item as read", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await waitForOwnNotifications(world.api, anna.session, (list) =>
    list.notifications.some((notification) => notification.readAt === null),
  );
  const item = body.notifications.find((notification) => notification.readAt === null);
  expect(item, "Anna has no unread item to mark").toBeDefined();
  if (item === undefined) {
    return;
  }
  world.notificationId = item.id;
  const response = await markOwnNotificationRead(world.api, anna.session, item.id);
  expect(response.status()).toBe(204);
});

Then("she has a new unread inbox item about the password change", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await waitForOwnNotifications(world.api, anna.session, (list) =>
    list.notifications.some((notification) => notification.type === "password-changed"),
  );
  const item = body.notifications.find((notification) => notification.type === "password-changed");
  expect(item?.readAt).toBeNull();
});

Then("it no longer counts as unread", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  const item = body.notifications.find((notification) => notification.id === world.notificationId);
  expect(item?.readAt).not.toBeNull();
  expect(body.unreadCount).toBe(0);
});

When("Anna marks all her notices as read", async ({ world }) => {
  const anna = personOf(world, "anna");
  const response = await markAllOwnNotificationsRead(world.api, anna.session);
  world.response = { status: response.status(), body: await response.json() };
});

Then("she has no unread notices", async ({ world }) => {
  const anna = personOf(world, "anna");
  const { body } = await listOwnNotifications(world.api, anna.session);
  expect(body.unreadCount).toBe(0);
});

Then(/^the number of notices marked is (\d+)$/, ({ world }, count: string) => {
  expect(world.response?.status).toBe(200);
  expect(world.response?.body).toEqual({ updated: Number(count) });
});

Then("Tom still has an unread notice", async ({ world }) => {
  const tom = personOf(world, "tom");
  const { body } = await listOwnNotifications(world.api, tom.session);
  expect(body.unreadCount).toBe(1);
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
