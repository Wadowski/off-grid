// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { createUser } from "../../application/registration/create-user.js";
import type { User } from "../../types.js";
import { insertSession } from "./insert-session.js";
import { revokeSession } from "./revoke-session.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("sessions", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;
  let user: User;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
    user = await createUser(db.db, {
      email: "ada@example.com",
      displayName: "Ada",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });
  });

  it("revokes a session once", async () => {
    const sessionId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, user.id);
      await insertSession(tx, {
        id: sessionId,
        userId: user.id,
        deviceLabel: "laptop",
        expiresAt: new Date(Date.now() + 3_600_000),
        refreshTokenHash: "a".repeat(64),
        accessTokenHash: "b".repeat(64),
        accessExpiresAt: new Date(Date.now() + 900_000),
      });
    });

    const first = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, user.id);
      return revokeSession(tx, sessionId);
    });
    const second = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, user.id);
      return revokeSession(tx, sessionId);
    });

    const { rows } = await db.admin.query(
      "SELECT revoked FROM identity.session WHERE session_id = $1",
      [sessionId],
    );
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(rows).toEqual([{ revoked: true }]);
  });
});
