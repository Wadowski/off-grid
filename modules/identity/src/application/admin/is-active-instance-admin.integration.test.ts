// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startIdentityTestDatabase } from "../../../test/start-identity-test-database.js";
import type { IdentityTestDatabase } from "../../../test/start-identity-test-database.js";
import { registerAccount } from "../registration/register-account.js";
import { isActiveInstanceAdmin } from "./is-active-instance-admin.js";

const STRONG_PASSWORD = "correct horse battery staple";

describe("isActiveInstanceAdmin", { timeout: 60_000 }, () => {
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

  const register = async (email: string): Promise<string> =>
    (
      await registerAccount(db.db, {
        email,
        displayName: "Test person",
        password: STRONG_PASSWORD,
      })
    ).user.id;

  it("is true for an active instance admin", async () => {
    const adminId = await register("anna@example.com");

    await expect(isActiveInstanceAdmin(db.db, adminId)).resolves.toBe(true);
  });

  it("is false for a regular user", async () => {
    await register("anna@example.com");
    const memberId = await register("tom@example.com");

    await expect(isActiveInstanceAdmin(db.db, memberId)).resolves.toBe(false);
  });

  it("is false for a disabled admin", async () => {
    const adminId = await register("anna@example.com");
    await db.admin.query(
      "UPDATE identity.user_account SET status = 'disabled' WHERE user_id = $1",
      [adminId],
    );

    await expect(isActiveInstanceAdmin(db.db, adminId)).resolves.toBe(false);
  });

  it("is false for an unknown user", async () => {
    await register("anna@example.com");

    await expect(isActiveInstanceAdmin(db.db, randomUUID())).resolves.toBe(false);
  });
});
