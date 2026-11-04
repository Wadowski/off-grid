// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { openMailPassword } from "../../infrastructure/mail/open-mail-password.js";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";
import type { MailConnection } from "../../types.js";

export const loadMailConnection = async (
  tx: ModuleTransaction,
  encryptionKey: Buffer,
): Promise<MailConnection | null> => {
  const record = await readMailSettings(tx);
  if (record === null) {
    return null;
  }
  return {
    host: record.smtpHost,
    port: record.smtpPort,
    security: record.smtpSecurity,
    username: record.username,
    password: openMailPassword(encryptionKey, record.passwordSealed),
    fromAddress: record.fromAddress,
  };
};
