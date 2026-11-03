// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { createUser } from "../application/registration/create-user.js";
import { insertUser } from "../infrastructure/accounts/insert-user.js";
import { publishUserCreated } from "./publish-user-created.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("user-created-v1 event", { timeout: 60_000 }, () => {
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

  it("drops the outbox event when the account change rolls back", async () => {
    const userId = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, userId);
        await insertUser(tx, {
          id: userId,
          email: "rolled@example.com",
          displayName: "Rolled",
          instanceRole: "admin",
        });
        await publishUserCreated(tx, { userId, displayName: "Rolled" });
        throw new Error("change failed");
      }),
    ).rejects.toThrow("change failed");

    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE user_id = $1",
      [userId],
    );
    expect(rows[0]).toEqual({ n: 0 });
  });

  it("writes one event, owned by the new user, when the account commits", async () => {
    const user = await createUser(db.db, {
      email: "committed@example.com",
      displayName: "Committed",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });

    const { rows } = await db.admin.query(
      "SELECT type, version, family_id, user_id, payload FROM outbox.event WHERE user_id = $1",
      [user.id],
    );

    expect(rows).toEqual([
      {
        type: "user-created-v1",
        version: 1,
        family_id: null,
        user_id: user.id,
        payload: { userId: user.id, displayName: "Committed" },
      },
    ]);
  });

  it("keeps the email address out of the event payload", async () => {
    await createUser(db.db, {
      email: "private@example.com",
      displayName: "Private",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });

    const { rows } = await db.admin.query("SELECT payload FROM outbox.event");

    expect(JSON.stringify(rows)).not.toContain("private@example.com");
  });
});
