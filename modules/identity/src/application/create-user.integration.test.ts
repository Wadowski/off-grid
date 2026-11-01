// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import type { CreateUserInput } from "../types.js";
import { createUser } from "./create-user.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

const accountInput = (overrides: Partial<CreateUserInput> = {}): CreateUserInput => ({
  email: `${randomUUID()}@example.com`,
  displayName: "Ada",
  passwordHash: HASH,
  recoveryCodeHash: "recovery-hash",
  ...overrides,
});

describe("createUser", () => {
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

  it("makes the first account the instance admin", async () => {
    const user = await createUser(db.db, accountInput());

    expect(user).toMatchObject({ instanceRole: "admin", status: "active" });
  });

  it("makes every later account a regular user", async () => {
    await createUser(db.db, accountInput());
    const later = await createUser(db.db, accountInput());

    expect(later.instanceRole).toBe("user");
  });

  it("stores the password hash and one active recovery code", async () => {
    const user = await createUser(db.db, accountInput({ recoveryCodeHash: "stored-hash" }));

    const { rows: credentials } = await db.admin.query(
      "SELECT password_hash FROM identity.credential WHERE user_id = $1",
      [user.id],
    );
    const { rows: codes } = await db.admin.query(
      `SELECT code_hash FROM identity.recovery_code
        WHERE user_id = $1 AND used_at IS NULL AND retired_at IS NULL`,
      [user.id],
    );

    expect(credentials).toEqual([{ password_hash: HASH }]);
    expect(codes).toEqual([{ code_hash: "stored-hash" }]);
  });

  it("refuses a second account whose email differs only by letter case", async () => {
    await createUser(db.db, accountInput({ email: "ada@example.com" }));

    await expect(createUser(db.db, accountInput({ email: "ADA@Example.com" }))).rejects.toThrow();

    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM identity.user_account");
    expect(rows[0]).toEqual({ n: 1 });
  });

  it("refuses an invalid account before writing anything", async () => {
    await expect(createUser(db.db, accountInput({ email: "not-an-email" }))).rejects.toBeInstanceOf(
      ZodError,
    );

    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM identity.user_account");
    expect(rows[0]).toEqual({ n: 0 });
  });
});
