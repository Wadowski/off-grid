// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { resolveMailConnection } from "../../domain/mail/resolve-mail-connection.js";
import { classifyMailError } from "../../domain/mail/classify-mail-error.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { MAIL_TEST_MESSAGE } from "../../constants.js";
import type { MailSender, MailSettingsRequest } from "../../types.js";
import { assertActiveAdmin } from "../admin/assert-active-admin.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { MailTestFailedError } from "../errors/mail-test-failed-error.js";

export const sendTestMail = async (
  db: ModuleDatabase,
  sendMail: MailSender,
  actorUserId: string,
  request: MailSettingsRequest,
): Promise<void> => {
  const adminEmail = await db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    return (await findAccount(tx, actorUserId))?.email ?? null;
  });
  if (adminEmail === null) {
    throw new AccountNotFoundError();
  }
  const connection = resolveMailConnection(request);
  try {
    await sendMail(connection, {
      to: adminEmail,
      from: connection.fromAddress,
      subject: MAIL_TEST_MESSAGE.subject,
      text: MAIL_TEST_MESSAGE.text,
    });
  } catch (error) {
    throw new MailTestFailedError(classifyMailError(error));
  }
};
