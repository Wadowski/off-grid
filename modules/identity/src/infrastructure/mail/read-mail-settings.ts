// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { INSTANCE_SETTINGS_KEY } from "../../constants.js";
import type { MailSettingsRecord } from "../../types.js";

export const readMailSettings = async (
  tx: ModuleTransaction,
): Promise<MailSettingsRecord | null> => {
  const row = await tx.mailSettings.findUnique({ where: { settingKey: INSTANCE_SETTINGS_KEY } });
  if (row === null) {
    return null;
  }
  return {
    provider: row.provider as MailSettingsRecord["provider"],
    fromAddress: row.fromAddress,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpSecurity: row.smtpSecurity as MailSettingsRecord["smtpSecurity"],
    username: row.username,
    passwordSealed: row.passwordSealed,
  };
};
