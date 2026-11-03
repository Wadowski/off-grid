// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { changeOwnPassword } from "../account/change-own-password.js";
import { hashPassword } from "../../infrastructure/credentials/hash-password.js";
import { createUser } from "../registration/create-user.js";
import { NotificationNotFoundError } from "../errors/notification-not-found-error.js";
import { listOwnNotifications } from "./list-own-notifications.js";
import { markOwnNotificationRead } from "./mark-own-notification-read.js";
import { raiseNotification } from "./raise-notification.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";
const CURRENT_PASSWORD = "Current passphrase 1";
const NEW_PASSWORD = "Another passphrase 2";

const newAccount = async (db: IdentityTestDatabase, displayName: string, passwordHash = HASH) =>
  createUser(db.db, {
    email: `${randomUUID()}@example.com`,
    displayName,
    passwordHash,
    recoveryCodeHash: "recovery-hash",
  });

describe("notifications", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it("drops the inbox item and its event when the change rolls back", async () => {
    const anna = await newAccount(db, "Anna");

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna.id);
        await raiseNotification(tx, { userId: anna.id, type: "password-changed" });
        throw new Error("change failed");
      }),
    ).rejects.toThrow("change failed");

    const { rows: items } = await db.admin.query(
      "SELECT count(*)::int AS n FROM identity.notification WHERE user_id = $1",
      [anna.id],
    );
    const { rows: events } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE user_id = $1 AND type = 'user-notified-v1'",
      [anna.id],
    );
    expect(items).toEqual([{ n: 0 }]);
    expect(events).toEqual([{ n: 0 }]);
  });

  it("gives a password change one unread item and one matching event", async () => {
    const anna = await newAccount(db, "Anna", await hashPassword(CURRENT_PASSWORD));

    const notification = await changeOwnPassword(db.db, anna.id, randomUUID(), {
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    const listed = await listOwnNotifications(db.db, anna.id);
    expect(listed).toMatchObject({
      unreadCount: 1,
      notifications: [{ id: notification.id, type: "password-changed", readAt: null }],
    });

    const { rows } = await db.admin.query(
      "SELECT payload FROM outbox.event WHERE user_id = $1 AND type = 'user-notified-v1'",
      [anna.id],
    );
    expect(rows).toEqual([
      {
        payload: {
          notificationId: notification.id,
          userId: anna.id,
          type: "password-changed",
          data: {},
        },
      },
    ]);
  });

  it("shows a person only their own notifications", async () => {
    const anna = await newAccount(db, "Anna");
    const tom = await newAccount(db, "Tom");
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, tom.id);
      await raiseNotification(tx, { userId: tom.id, type: "password-changed" });
    });

    expect(await listOwnNotifications(db.db, anna.id)).toEqual({
      notifications: [],
      unreadCount: 0,
    });
  });

  it("marks an item read once and does not count it as unread afterwards", async () => {
    const anna = await newAccount(db, "Anna");
    const { id } = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, anna.id);
      return raiseNotification(tx, { userId: anna.id, type: "recovery-code-regenerated" });
    });

    await markOwnNotificationRead(db.db, anna.id, id);
    const firstRead = await listOwnNotifications(db.db, anna.id);
    await markOwnNotificationRead(db.db, anna.id, id);
    const secondRead = await listOwnNotifications(db.db, anna.id);

    expect(firstRead.unreadCount).toBe(0);
    expect(firstRead.notifications[0]?.readAt).not.toBeNull();
    expect(secondRead.notifications[0]?.readAt).toBe(firstRead.notifications[0]?.readAt);
  });

  it("refuses to mark another person's item as read", async () => {
    const anna = await newAccount(db, "Anna");
    const tom = await newAccount(db, "Tom");
    const { id } = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, tom.id);
      return raiseNotification(tx, { userId: tom.id, type: "password-changed" });
    });

    await expect(markOwnNotificationRead(db.db, anna.id, id)).rejects.toBeInstanceOf(
      NotificationNotFoundError,
    );
    expect((await listOwnNotifications(db.db, tom.id)).unreadCount).toBe(1);
  });
});
