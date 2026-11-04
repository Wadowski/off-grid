// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { MAIL_PROVIDERS, MAIL_SECURITY } from "./constants.js";

export const mailSettingsSchema = z.object({
  configured: z.boolean(),
  provider: z.enum(MAIL_PROVIDERS).nullable(),
  fromAddress: z.string().nullable(),
  smtpHost: z.string().nullable(),
  smtpPort: z.number().int().nullable(),
  smtpSecurity: z.enum(MAIL_SECURITY).nullable(),
  username: z.string().nullable(),
});
