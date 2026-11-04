// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { INSTANCE_SETTINGS_KEY } from "../../constants.js";
import type { MailSettingsRecord } from "../../types.js";

export const upsertMailSettings = async (
  tx: ModuleTransaction,
  record: MailSettingsRecord,
  now: Date,
): Promise<void> => {
  const values = {
    provider: record.provider,
    fromAddress: record.fromAddress,
    smtpHost: record.smtpHost,
    smtpPort: record.smtpPort,
    smtpSecurity: record.smtpSecurity,
    username: record.username,
    passwordSealed: record.passwordSealed,
    updatedAt: now,
  };
  await tx.mailSettings.upsert({
    where: { settingKey: INSTANCE_SETTINGS_KEY },
    create: { settingKey: INSTANCE_SETTINGS_KEY, ...values },
    update: values,
  });
};
