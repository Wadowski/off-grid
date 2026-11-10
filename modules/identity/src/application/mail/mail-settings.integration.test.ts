// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { AdminRequiredError } from "../errors/admin-required-error.js";
import { MailTestFailedError } from "../errors/mail-test-failed-error.js";
import { registerAccount } from "../registration/register-account.js";
import type { MailSender, MailSettingsRequest } from "../../types.js";
import { getMailSettings } from "./get-mail-settings.js";
import { isMailConfigured } from "./is-mail-configured.js";
import { saveMailSettings } from "./save-mail-settings.js";
import { sendTestMail } from "./send-test-mail.js";

const STRONG_PASSWORD = "correct horse battery staple";
const APP_PASSWORD = "abcd efgh ijkl mnop";
const ENCRYPTION_KEY = randomBytes(32);

const gmailRequest: MailSettingsRequest = {
  provider: "gmail",
  email: "anna@gmail.com",
  password: APP_PASSWORD,
};

describe("mail settings", { timeout: 60_000 }, () => {
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

  it("saves Gmail settings with the server details filled in and never returns the password", async () => {
    const adminId = await registerAdmin();

    const saved = await saveMailSettings(db.db, ENCRYPTION_KEY, adminId, gmailRequest);

    expect(saved).toEqual({
      configured: true,
      provider: "gmail",
      fromAddress: "anna@gmail.com",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecurity: "starttls",
      username: "anna@gmail.com",
    });
    expect(JSON.stringify(await getMailSettings(db.db, adminId))).not.toContain("abcdefghijklmnop");
  });

  it("refuses to read or save mail settings for a regular user", async () => {
    await registerAdmin();
    const memberId = await registerMember();

    await expect(getMailSettings(db.db, memberId)).rejects.toBeInstanceOf(AdminRequiredError);
    await expect(
      saveMailSettings(db.db, ENCRYPTION_KEY, memberId, gmailRequest),
    ).rejects.toBeInstanceOf(AdminRequiredError);
  });

  it("reports mail as not configured until settings are saved", async () => {
    const adminId = await registerAdmin();
    expect(await isMailConfigured(db.db, adminId)).toBe(false);

    await saveMailSettings(db.db, ENCRYPTION_KEY, adminId, gmailRequest);

    expect(await isMailConfigured(db.db, adminId)).toBe(true);
  });

  it("reports a rejected app password when the test email fails authentication", async () => {
    const adminId = await registerAdmin();
    const rejectingSender = vi.fn(async () => {
      throw Object.assign(new Error("535 Invalid credentials"), { responseCode: 535 });
    });

    const attempt = sendTestMail(db.db, rejectingSender, adminId, gmailRequest);

    await expect(attempt).rejects.toBeInstanceOf(MailTestFailedError);
    await expect(attempt).rejects.toMatchObject({ reason: "AUTH_REJECTED" });
  });

  it("sends the test email to the admin's own address with the resolved connection", async () => {
    const adminId = await registerAdmin();
    const sender = vi.fn<MailSender>(async () => undefined);

    await sendTestMail(db.db, sender, adminId, gmailRequest);

    expect(sender).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.gmail.com", password: "abcdefghijklmnop" }),
      expect.objectContaining({ to: "anna@example.com", from: "anna@gmail.com" }),
    );
  });
});
