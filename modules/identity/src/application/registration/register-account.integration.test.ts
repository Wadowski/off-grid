// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { getRegistrationStatus } from "./get-registration-status.js";
import { EmailTakenError } from "../errors/email-taken-error.js";
import { FirstAdminClaimedError } from "../errors/first-admin-claimed-error.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";
import { RegistrationClosedError } from "../errors/registration-closed-error.js";
import { registerAccount } from "./register-account.js";

const STRONG_PASSWORD = "correct horse battery staple";

const sha256Hex = (value: string): string =>
  createHash("sha256").update(value, "utf8").digest("hex");

describe("registerAccount", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("UPDATE identity.instance_settings SET registration_open = true");
  }, 60_000);

  const roleOf = async (email: string): Promise<string | undefined> => {
    const { rows } = await db.admin.query<{ instance_role: string }>(
      "SELECT instance_role FROM identity.user_account WHERE email = $1",
      [email],
    );
    return rows[0]?.instance_role;
  };

  const countAccounts = async (): Promise<number> => {
    const { rows } = await db.admin.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM identity.user_account",
    );
    return Number(rows[0]?.count);
  };

  it("makes the first account the admin and returns a recovery code", async () => {
    const account = await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    expect(account.user.instanceRole).toBe("admin");
    expect(account.recoveryCode).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(await roleOf("anna@example.com")).toBe("admin");
  });

  it("stores only the digest of the recovery code", async () => {
    const account = await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    const { rows } = await db.admin.query<{ code_hash: string }>(
      "SELECT code_hash FROM identity.recovery_code WHERE user_id = $1",
      [account.user.id],
    );
    expect(rows).toEqual([{ code_hash: sha256Hex(account.recoveryCode) }]);
  });

  it("stores only the digest of the refresh token and signs the new user in", async () => {
    const account = await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    const { rows } = await db.admin.query<{
      refresh_token_hash: string;
      revoked: boolean;
      expires_at: Date;
    }>("SELECT refresh_token_hash, revoked, expires_at FROM identity.session WHERE user_id = $1", [
      account.user.id,
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.refresh_token_hash).toBe(sha256Hex(account.refreshToken));
    expect(rows[0]?.revoked).toBe(false);
    expect(rows[0]?.expires_at.getTime()).toBe(account.sessionExpiresAt.getTime());
  });

  it("stores a password hash, never the password", async () => {
    const account = await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    const { rows } = await db.admin.query<{ password_hash: string }>(
      "SELECT password_hash FROM identity.credential WHERE user_id = $1",
      [account.user.id],
    );
    expect(rows[0]?.password_hash).toMatch(/^\$argon2id\$/);
    expect(rows[0]?.password_hash).not.toContain(STRONG_PASSWORD);
  });

  it("makes later accounts regular users while registration is open", async () => {
    await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    const second = await registerAccount(db.db, {
      email: "ben@example.com",
      displayName: "Ben",
      password: "another long passphrase",
    });

    expect(second.user.instanceRole).toBe("user");
    expect(await roleOf("ben@example.com")).toBe("user");
  });

  it("refuses new accounts while registration is closed", async () => {
    await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });
    await db.admin.query("UPDATE identity.instance_settings SET registration_open = false");

    await expect(
      registerAccount(db.db, {
        email: "ben@example.com",
        displayName: "Ben",
        password: "another long passphrase",
      }),
    ).rejects.toBeInstanceOf(RegistrationClosedError);
    expect(await countAccounts()).toBe(1);
  });

  it("refuses a password shorter than 12 characters and creates no account", async () => {
    const attempt = registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: "short-pass",
    });

    await expect(attempt).rejects.toBeInstanceOf(PasswordRejectedError);
    expect(await countAccounts()).toBe(0);
  });

  it("refuses an email that is already used, ignoring case", async () => {
    await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    await expect(
      registerAccount(db.db, {
        email: "Anna@Example.com",
        displayName: "Anna Two",
        password: "another long passphrase",
      }),
    ).rejects.toBeInstanceOf(EmailTakenError);
    expect(await countAccounts()).toBe(1);
  });

  it("lets only one of two simultaneous first sign-ups become admin", async () => {
    const results = await Promise.allSettled([
      registerAccount(db.db, {
        email: "anna@example.com",
        displayName: "Anna",
        password: STRONG_PASSWORD,
      }),
      registerAccount(db.db, {
        email: "ben@example.com",
        displayName: "Ben",
        password: "another long passphrase",
      }),
    ]);

    const roles = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value.user.instanceRole] : [],
    );
    const failures = results.flatMap((result) =>
      result.status === "rejected" ? [result.reason] : [],
    );
    expect(roles.filter((role) => role === "admin")).toHaveLength(1);
    failures.forEach((reason) => expect(reason).toBeInstanceOf(FirstAdminClaimedError));
    expect(await countAccounts()).toBe(roles.length);
  });

  it("reports a fresh server with registration open before anyone registers", async () => {
    await expect(getRegistrationStatus(db.db)).resolves.toEqual({
      freshServer: true,
      registrationOpen: true,
    });
  });

  it("reports the server as no longer fresh once an account exists", async () => {
    await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

    await expect(getRegistrationStatus(db.db)).resolves.toEqual({
      freshServer: false,
      registrationOpen: true,
    });
  });
});
