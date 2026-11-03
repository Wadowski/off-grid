// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { AdminAlreadyActiveError } from "../errors/admin-already-active-error.js";
import { AdminRequiredError } from "../errors/admin-required-error.js";
import { completePasswordReset } from "../password-reset/complete-password-reset.js";
import { createRecoveryAdmin } from "../registration/create-recovery-admin.js";
import { getAdminInstanceSettings } from "./get-admin-instance-settings.js";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error.js";
import { InvalidResetCodeError } from "../errors/invalid-reset-code-error.js";
import { LastAdminError } from "../errors/last-admin-error.js";
import { listUsers } from "./list-users.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";
import { RegistrationClosedError } from "../errors/registration-closed-error.js";
import { registerAccount } from "../registration/register-account.js";
import { resetAdminPasswordByEmail } from "../password-reset/reset-admin-password-by-email.js";
import { setUserDisabled } from "./set-user-disabled.js";
import { signIn } from "../sessions/sign-in.js";
import { startPasswordReset } from "../password-reset/start-password-reset.js";
import { updateInstanceSettings } from "./update-instance-settings.js";
import { verifyAccessToken } from "../sessions/verify-access-token.js";

const STRONG_PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "a different long passphrase";
const DAY_MS = 24 * 60 * 60 * 1000;

describe("instance administration", { timeout: 60_000 }, () => {
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

  const registerAdmin = async (): Promise<string> =>
    (
      await registerAccount(db.db, {
        email: "anna@example.com",
        displayName: "Anna",
        password: STRONG_PASSWORD,
      })
    ).user.id;

  const registerMember = async (): Promise<string> =>
    (
      await registerAccount(db.db, {
        email: "tom@example.com",
        displayName: "Tom",
        password: STRONG_PASSWORD,
      })
    ).user.id;

  const sessionsRevokedFor = async (userId: string): Promise<boolean[]> => {
    const { rows } = await db.admin.query<{ revoked: boolean }>(
      "SELECT revoked FROM identity.session WHERE user_id = $1",
      [userId],
    );
    return rows.map((row) => row.revoked);
  };

  describe("listing and access", () => {
    it("lets an active admin see every account with its role and status", async () => {
      const adminId = await registerAdmin();
      await registerMember();

      const users = await listUsers(db.db, adminId);

      expect(users.map((user) => [user.email, user.instanceRole, user.status])).toEqual([
        ["anna@example.com", "admin", "active"],
        ["tom@example.com", "user", "active"],
      ]);
    });

    it("refuses a regular user on every admin query", async () => {
      await registerAdmin();
      const memberId = await registerMember();

      await expect(listUsers(db.db, memberId)).rejects.toBeInstanceOf(AdminRequiredError);
      await expect(getAdminInstanceSettings(db.db, memberId)).rejects.toBeInstanceOf(
        AdminRequiredError,
      );
      await expect(setUserDisabled(db.db, memberId, memberId, true)).rejects.toBeInstanceOf(
        AdminRequiredError,
      );
    });

    it("refuses a request from a user that is not signed in", async () => {
      await registerAdmin();

      await expect(listUsers(db.db, randomUUID())).rejects.toBeInstanceOf(AdminRequiredError);
    });
  });

  describe("disabling accounts", () => {
    it("ends the sessions of a disabled account and refuses its sign-in", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const memberSession = await signIn(db.db, {
        email: "tom@example.com",
        password: STRONG_PASSWORD,
      });

      const disabled = await setUserDisabled(db.db, adminId, memberId, true);

      expect(disabled.status).toBe("disabled");
      const revoked = await sessionsRevokedFor(memberId);
      expect(revoked).not.toHaveLength(0);
      expect(revoked.every(Boolean)).toBe(true);
      expect(await verifyAccessToken(db.db, memberSession.accessToken)).toBeNull();
      await expect(
        signIn(db.db, { email: "tom@example.com", password: STRONG_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("lets the account sign in again once it is re-enabled", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      await setUserDisabled(db.db, adminId, memberId, true);

      const enabled = await setUserDisabled(db.db, adminId, memberId, false);

      expect(enabled.status).toBe("active");
      await expect(
        signIn(db.db, { email: "tom@example.com", password: STRONG_PASSWORD }),
      ).resolves.toMatchObject({ user: { id: memberId } });
    });

    it("refuses to disable the last active admin, including the admin themselves", async () => {
      const adminId = await registerAdmin();

      await expect(setUserDisabled(db.db, adminId, adminId, true)).rejects.toBeInstanceOf(
        LastAdminError,
      );
    });

    it("allows disabling an admin while another active admin remains", async () => {
      const adminId = await registerAdmin();
      const secondAdminId = await registerAccount(db.db, {
        email: "ben@example.com",
        displayName: "Ben",
        password: STRONG_PASSWORD,
      }).then((account) => account.user.id);
      await db.admin.query(
        "UPDATE identity.user_account SET instance_role = 'admin' WHERE user_id = $1",
        [secondAdminId],
      );

      const disabled = await setUserDisabled(db.db, adminId, adminId, true);

      expect(disabled.status).toBe("disabled");
    });

    it("reports an unknown account as not found", async () => {
      const adminId = await registerAdmin();

      await expect(setUserDisabled(db.db, adminId, randomUUID(), true)).rejects.toBeInstanceOf(
        AccountNotFoundError,
      );
    });
  });

  describe("password reset codes", () => {
    it("lets the person set a new password with the code, once", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const memberSession = await signIn(db.db, {
        email: "tom@example.com",
        password: STRONG_PASSWORD,
      });
      const issued = await startPasswordReset(db.db, adminId, memberId);

      await completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD });

      await expect(
        signIn(db.db, { email: "tom@example.com", password: NEW_PASSWORD }),
      ).resolves.toMatchObject({ user: { id: memberId } });
      await expect(
        signIn(db.db, { email: "tom@example.com", password: STRONG_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
      expect(await verifyAccessToken(db.db, memberSession.accessToken)).toBeNull();
      await expect(
        completePasswordReset(db.db, { code: issued.code, password: "yet another passphrase" }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
    });

    it("ends the person's sessions as soon as the reset is issued", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const memberSession = await signIn(db.db, {
        email: "tom@example.com",
        password: STRONG_PASSWORD,
      });

      await startPasswordReset(db.db, adminId, memberId);

      expect(await verifyAccessToken(db.db, memberSession.accessToken)).toBeNull();
      expect(await sessionsRevokedFor(memberId)).toEqual(expect.arrayContaining([true]));
      await expect(
        signIn(db.db, { email: "tom@example.com", password: STRONG_PASSWORD }),
      ).resolves.toBeDefined();
    });

    it("accepts the code without its dashes and in lower case", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const issued = await startPasswordReset(db.db, adminId, memberId);
      const typed = issued.code.replace(/-/g, "").toLowerCase();

      await completePasswordReset(db.db, { code: typed, password: NEW_PASSWORD });

      await expect(
        signIn(db.db, { email: "tom@example.com", password: NEW_PASSWORD }),
      ).resolves.toBeDefined();
    });

    it("refuses a wrong code", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      await startPasswordReset(db.db, adminId, memberId);

      await expect(
        completePasswordReset(db.db, { code: "AAAA-AAAA-AAAA", password: NEW_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
    });

    it("refuses an expired code", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const issued = await startPasswordReset(
        db.db,
        adminId,
        memberId,
        new Date(Date.now() - 2 * DAY_MS),
      );

      await expect(
        completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
    });

    it("keeps the code usable when the new password breaks the rules", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const issued = await startPasswordReset(db.db, adminId, memberId);

      await expect(
        completePasswordReset(db.db, { code: issued.code, password: "short" }),
      ).rejects.toBeInstanceOf(PasswordRejectedError);

      await expect(
        completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD }),
      ).resolves.toBeUndefined();
    });

    it("retires the previous code when a new one is started", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const first = await startPasswordReset(db.db, adminId, memberId);
      const second = await startPasswordReset(db.db, adminId, memberId);

      await expect(
        completePasswordReset(db.db, { code: first.code, password: NEW_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
      await expect(
        completePasswordReset(db.db, { code: second.code, password: NEW_PASSWORD }),
      ).resolves.toBeUndefined();
    });

    it("refuses a reset for a disabled account", async () => {
      const adminId = await registerAdmin();
      const memberId = await registerMember();
      const issued = await startPasswordReset(db.db, adminId, memberId);
      await setUserDisabled(db.db, adminId, memberId, true);

      await expect(
        completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
    });

    it("refuses a regular user starting a reset", async () => {
      await registerAdmin();
      const memberId = await registerMember();

      await expect(startPasswordReset(db.db, memberId, memberId)).rejects.toBeInstanceOf(
        AdminRequiredError,
      );
    });
  });

  describe("registration switch", () => {
    it("refuses new sign-ups once an admin closes registration", async () => {
      const adminId = await registerAdmin();

      await updateInstanceSettings(db.db, adminId, false);

      expect(await getAdminInstanceSettings(db.db, adminId)).toEqual({ registrationOpen: false });
      await expect(
        registerAccount(db.db, {
          email: "tom@example.com",
          displayName: "Tom",
          password: STRONG_PASSWORD,
        }),
      ).rejects.toBeInstanceOf(RegistrationClosedError);
    });

    it("accepts sign-ups again after the admin reopens registration", async () => {
      const adminId = await registerAdmin();
      await updateInstanceSettings(db.db, adminId, false);

      await updateInstanceSettings(db.db, adminId, true);

      await expect(
        registerAccount(db.db, {
          email: "tom@example.com",
          displayName: "Tom",
          password: STRONG_PASSWORD,
        }),
      ).resolves.toBeDefined();
    });
  });

  describe("host recovery", () => {
    it("resets the admin password from the host with a one-time code", async () => {
      await registerAdmin();

      const issued = await resetAdminPasswordByEmail(db.db, "anna@example.com");
      await completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD });

      await expect(
        signIn(db.db, { email: "anna@example.com", password: NEW_PASSWORD }),
      ).resolves.toBeDefined();
    });

    it("refuses to reset the password of an account that is not an admin", async () => {
      await registerAdmin();
      await registerMember();

      await expect(resetAdminPasswordByEmail(db.db, "tom@example.com")).rejects.toBeInstanceOf(
        AccountNotFoundError,
      );
    });

    it("creates the first admin when no admin exists", async () => {
      const issued = await createRecoveryAdmin(db.db, {
        email: "owner@example.com",
        displayName: "Owner",
      });
      await completePasswordReset(db.db, { code: issued.code, password: NEW_PASSWORD });

      const session = await signIn(db.db, { email: "owner@example.com", password: NEW_PASSWORD });
      expect(session.user.instanceRole).toBe("admin");
      const { rows } = await db.admin.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM identity.first_admin_claim",
      );
      expect(rows[0]?.count).toBe("1");
    });

    it("refuses to create an admin while an active admin exists", async () => {
      await registerAdmin();

      await expect(
        createRecoveryAdmin(db.db, { email: "owner@example.com", displayName: "Owner" }),
      ).rejects.toBeInstanceOf(AdminAlreadyActiveError);
    });
  });
});
