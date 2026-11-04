// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAIL_PROVIDERS, MAIL_SECURITY } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import { z } from "zod";
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
    provider: z.enum(MAIL_PROVIDERS).parse(row.provider),
    fromAddress: row.fromAddress,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpSecurity: z.enum(MAIL_SECURITY).parse(row.smtpSecurity),
    username: row.username,
    passwordSealed: row.passwordSealed,
  };
};
