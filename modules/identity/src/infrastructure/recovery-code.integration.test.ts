// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { createUser } from "../application/create-user.js";
import { rotateRecoveryCode } from "../application/rotate-recovery-code.js";
import type { User } from "../types.js";
import { consumeRecoveryCode } from "./consume-recovery-code.js";
import { insertRecoveryCode } from "./insert-recovery-code.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("recovery codes", { timeout: 60_000 }, () => {
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
      recoveryCodeHash: "first-hash",
    });
  });

  const consume = (codeHash: string) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, user.id);
      return consumeRecoveryCode(tx, user.id, codeHash);
    });

  it("accepts a recovery code once", async () => {
    expect(await consume("first-hash")).toBe(true);
    expect(await consume("first-hash")).toBe(false);
  });

  it("refuses a code that does not match", async () => {
    expect(await consume("wrong-hash")).toBe(false);
  });

  it("retires the old code when rotated, so only the new code works", async () => {
    await rotateRecoveryCode(db.db, user.id, "second-hash");

    expect(await consume("first-hash")).toBe(false);
    expect(await consume("second-hash")).toBe(true);
  });

  it("allows only one active code per user", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, user.id);
        await insertRecoveryCode(tx, { id: randomUUID(), userId: user.id, codeHash: "extra-hash" });
      }),
    ).rejects.toThrow();
  });
});
