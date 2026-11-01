// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { createUser } from "../application/create-user.js";
import type { User } from "../types.js";
import { insertCredential } from "./insert-credential.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("credentials", () => {
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

  it("refuses a password stored in plain text, even when written directly", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, user.id);
        await tx.credential.update({
          where: { userId: user.id },
          data: { passwordHash: "hunter2" },
        });
      }),
    ).rejects.toThrow();

    const { rows } = await db.admin.query(
      "SELECT password_hash FROM identity.credential WHERE user_id = $1",
      [user.id],
    );
    expect(rows).toEqual([{ password_hash: HASH }]);
  });

  it("refuses a second credential for the same user", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, user.id);
        await insertCredential(tx, user.id, HASH);
      }),
    ).rejects.toThrow();
  });
});
