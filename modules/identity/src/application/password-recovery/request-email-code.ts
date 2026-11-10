// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { EMAIL_CODE_LIFETIME_MS, EMAIL_CODE_REQUEST_COOLDOWN_MS } from "../../constants.js";
import { buildRecoveryCodeMessage } from "../../domain/mail/build-recovery-code-message.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { normalizeResetCode } from "../../domain/password-reset/normalize-reset-code.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import { attemptKey } from "../../infrastructure/attempt-counters/attempt-key.js";
import { claimRequestSlot } from "../../infrastructure/attempt-counters/claim-request-slot.js";
import { insertPasswordReset } from "../../infrastructure/password-resets/insert-password-reset.js";
import { retireActivePasswordResets } from "../../infrastructure/password-resets/retire-active-password-resets.js";
import { generateEmailCode } from "../../infrastructure/password-resets/generate-email-code.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import type { EmailChannelDependencies, EmailCodeRequestInput } from "../../types.js";
import { loadMailConnection } from "../mail/load-mail-connection.js";
import { sendWithRetry } from "../mail/send-with-retry.js";
import { EmailNotConfiguredError } from "../errors/email-not-configured-error.js";

export const requestEmailCode = async (
  dependencies: EmailChannelDependencies,
  input: EmailCodeRequestInput,
  now: Date = new Date(),
): Promise<void> => {
  const connection = await dependencies.db.$transaction((tx) =>
    loadMailConnection(tx, dependencies.encryptionKey),
  );
  if (connection === null) {
    throw new EmailNotConfiguredError();
  }
  const email = normalizeEmail(input.email);
  const claimed = await dependencies.db.$transaction((tx) =>
    claimRequestSlot(
      tx,
      attemptKey("email-code-request", email),
      now,
      EMAIL_CODE_REQUEST_COOLDOWN_MS,
    ),
  );
  if (!claimed) {
    return;
  }
  const account = await findAccountForSignIn(dependencies.db, email);
  if (account === null || account.status !== "active") {
    return;
  }
  const code = generateEmailCode();
  await dependencies.db.$transaction(async (tx) => {
    await withUserContext(tx, account.userId);
    await retireActivePasswordResets(tx, account.userId, now);
    await insertPasswordReset(tx, {
      id: randomUUID(),
      userId: account.userId,
      codeHash: digestToken(normalizeResetCode(code)),
      expiresAt: new Date(now.getTime() + EMAIL_CODE_LIFETIME_MS),
    });
  });
  sendWithRetry(
    () =>
      dependencies.sendMail(
        connection,
        buildRecoveryCodeMessage(code, account.email, connection.fromAddress),
      ),
    dependencies.retryDelaysMs,
    dependencies.logger,
    { channel: "email", purpose: "password-recovery" },
  );
};
