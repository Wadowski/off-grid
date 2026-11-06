// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { vi, afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { RECOVERY_FAILURE_LIMIT } from "../../constants.js";
import { sealMailPassword } from "../../infrastructure/mail/seal-mail-password.js";
import { upsertMailSettings } from "../../infrastructure/mail/upsert-mail-settings.js";
import type { EmailChannelDependencies, MailMessage } from "../../types.js";
import { completePasswordReset } from "../password-reset/complete-password-reset.js";
import { EmailNotConfiguredError } from "../errors/email-not-configured-error.js";
import { InvalidRecoveryCodeError } from "../errors/invalid-recovery-code-error.js";
import { InvalidResetCodeError } from "../errors/invalid-reset-code-error.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";
import { RecoveryLockedError } from "../errors/recovery-locked-error.js";
import { registerAccount } from "../registration/register-account.js";
import { recoverWithRecoveryCode } from "./recover-with-recovery-code.js";
import { requestEmailCode } from "./request-email-code.js";

const STRONG_PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "a brand new passphrase 42";
const EMAIL = "anna@example.com";
const MAIL_KEY = Buffer.alloc(32, 7);

describe("password recovery", { timeout: 60_000 }, () => {
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

  const signUpAnna = () =>
    registerAccount(db.db, {
      email: EMAIL,
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });

  const notificationTypesOf = async (email: string): Promise<string[]> => {
    const { rows } = await db.admin.query<{ type: string }>(
      `SELECT n.type FROM identity.notification n
         JOIN identity.user_account u ON u.user_id = n.user_id
        WHERE u.email = $1`,
      [email],
    );
    return rows.map((row) => row.type);
  };

  const activeRecoveryCodeCount = async (email: string): Promise<number> => {
    const { rows } = await db.admin.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM identity.recovery_code rc
         JOIN identity.user_account u ON u.user_id = rc.user_id
        WHERE u.email = $1 AND rc.used_at IS NULL AND rc.retired_at IS NULL`,
      [email],
    );
    return Number(rows[0]?.count);
  };

  const configureMail = async (): Promise<void> => {
    await db.db.$transaction(async (tx) => {
      await upsertMailSettings(
        tx,
        {
          provider: "other",
          fromAddress: "offgrid@example.com",
          smtpHost: "smtp.example.com",
          smtpPort: 587,
          smtpSecurity: "starttls",
          username: "offgrid@example.com",
          passwordSealed: sealMailPassword(MAIL_KEY, "app-password"),
        },
        new Date(),
      );
    });
  };

  const mailDependencies = (
    sendMail: (message: MailMessage) => Promise<void>,
  ): EmailChannelDependencies => ({
    db: db.db,
    encryptionKey: MAIL_KEY,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as EmailChannelDependencies["logger"],
    sendMail: (_connection, message) => sendMail(message),
    retryDelaysMs: [],
  });

  describe("recoverWithRecoveryCode", () => {
    it("resets the password, returns a new recovery code and retires the old one", async () => {
      const account = await signUpAnna();

      const outcome = await recoverWithRecoveryCode(db.db, {
        email: EMAIL,
        recoveryCode: account.recoveryCode,
        password: NEW_PASSWORD,
      });

      expect(outcome.recoveryCode).toMatch(/^[A-Za-z0-9_-]{22}$/);
      expect(outcome.recoveryCode).not.toBe(account.recoveryCode);
      expect(await activeRecoveryCodeCount(EMAIL)).toBe(1);
    });

    it("refuses a recovery code that has already been used", async () => {
      const account = await signUpAnna();
      await recoverWithRecoveryCode(db.db, {
        email: EMAIL,
        recoveryCode: account.recoveryCode,
        password: NEW_PASSWORD,
      });

      await expect(
        recoverWithRecoveryCode(db.db, {
          email: EMAIL,
          recoveryCode: account.recoveryCode,
          password: NEW_PASSWORD,
        }),
      ).rejects.toBeInstanceOf(InvalidRecoveryCodeError);
    });

    it("keeps the recovery code usable when the new password is rejected", async () => {
      const account = await signUpAnna();

      await expect(
        recoverWithRecoveryCode(db.db, {
          email: EMAIL,
          recoveryCode: account.recoveryCode,
          password: "short",
        }),
      ).rejects.toBeInstanceOf(PasswordRejectedError);

      expect(await activeRecoveryCodeCount(EMAIL)).toBe(1);
      await expect(
        recoverWithRecoveryCode(db.db, {
          email: EMAIL,
          recoveryCode: account.recoveryCode,
          password: NEW_PASSWORD,
        }),
      ).resolves.toBeDefined();
    });

    it("gives the same refusal for an unknown email as for a wrong code", async () => {
      await signUpAnna();

      await expect(
        recoverWithRecoveryCode(db.db, {
          email: "nobody@example.com",
          recoveryCode: "not-a-real-code",
          password: NEW_PASSWORD,
        }),
      ).rejects.toBeInstanceOf(InvalidRecoveryCodeError);
    });

    it("refuses further attempts for a while after repeated wrong codes", async () => {
      await signUpAnna();
      const attempt = () =>
        recoverWithRecoveryCode(db.db, {
          email: EMAIL,
          recoveryCode: "wrong-code",
          password: NEW_PASSWORD,
        });

      for (let count = 0; count < RECOVERY_FAILURE_LIMIT; count += 1) {
        await expect(attempt()).rejects.toBeInstanceOf(InvalidRecoveryCodeError);
      }

      await expect(attempt()).rejects.toBeInstanceOf(RecoveryLockedError);
    });

    it("raises a security notification", async () => {
      const account = await signUpAnna();

      await recoverWithRecoveryCode(db.db, {
        email: EMAIL,
        recoveryCode: account.recoveryCode,
        password: NEW_PASSWORD,
      });

      expect(await notificationTypesOf(EMAIL)).toContain("password-changed");
    });
  });

  describe("requestEmailCode", () => {
    it("refuses when email is not configured", async () => {
      await signUpAnna();
      const sendMail = vi.fn(async () => undefined);

      await expect(
        requestEmailCode(mailDependencies(sendMail), { email: EMAIL }),
      ).rejects.toBeInstanceOf(EmailNotConfiguredError);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it("emails the code to the account owner, valid for 15 minutes", async () => {
      await signUpAnna();
      await configureMail();
      const sent: MailMessage[] = [];

      await requestEmailCode(
        mailDependencies(async (message) => {
          sent.push(message);
        }),
        { email: EMAIL },
      );

      await vi.waitFor(() => expect(sent).toHaveLength(1));
      expect(sent[0]?.to).toBe(EMAIL);
      expect(sent[0]?.text).toContain("10 minutes");
    });

    it("lets the emailed code reset the password once", async () => {
      await signUpAnna();
      await configureMail();
      const sent: MailMessage[] = [];

      await requestEmailCode(
        mailDependencies(async (message) => {
          sent.push(message);
        }),
        { email: EMAIL },
      );

      await vi.waitFor(() => expect(sent).toHaveLength(1));
      const code = /Your password reset code is (\S+)\./.exec(sent[0]?.text ?? "")?.[1] ?? "";
      await expect(
        completePasswordReset(db.db, { email: EMAIL, code, password: NEW_PASSWORD }),
      ).resolves.toMatchObject({ recoveryCode: expect.any(String) });
      await expect(
        completePasswordReset(db.db, { email: EMAIL, code, password: NEW_PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidResetCodeError);
    });

    it("does nothing and reports nothing for an unknown email", async () => {
      await configureMail();
      const sendMail = vi.fn(async () => undefined);

      await expect(
        requestEmailCode(mailDependencies(sendMail), { email: "nobody@example.com" }),
      ).resolves.toBeUndefined();
      expect(sendMail).not.toHaveBeenCalled();
    });

    it("sends at most one emailed code per address within the cooldown", async () => {
      await signUpAnna();
      await configureMail();
      const sendMail = vi.fn(async () => undefined);
      const dependencies = mailDependencies(sendMail);

      await requestEmailCode(dependencies, { email: EMAIL });
      await requestEmailCode(dependencies, { email: EMAIL });

      await vi.waitFor(() => expect(sendMail).toHaveBeenCalledTimes(1));
    });
  });

  describe("completePasswordReset with wrong emailed codes", () => {
    it("refuses further attempts for the address after five wrong codes", async () => {
      await signUpAnna();
      const attempt = () =>
        completePasswordReset(db.db, { email: EMAIL, code: "00000000", password: NEW_PASSWORD });

      for (let count = 0; count < RECOVERY_FAILURE_LIMIT; count += 1) {
        await expect(attempt()).rejects.toBeInstanceOf(InvalidResetCodeError);
      }

      await expect(attempt()).rejects.toBeInstanceOf(RecoveryLockedError);
    });
  });
});
