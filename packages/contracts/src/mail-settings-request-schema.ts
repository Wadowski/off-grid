// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { MAIL_SECURITY } from "./constants.js";

const MAX_PASSWORD_LENGTH = 256;
const MAX_HOST_LENGTH = 253;
const MAX_EMAIL_LENGTH = 254;

const emailAddressSchema = z.string().trim().max(MAX_EMAIL_LENGTH).pipe(z.email());

const sharedMailAccountFields = {
  email: emailAddressSchema,
  fromAddress: emailAddressSchema.optional(),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
};

const presetMailAccountSchema = z.object({
  ...sharedMailAccountFields,
  provider: z.enum(["gmail", "icloud", "fastmail"]),
});

const customMailServerSchema = z.object({
  ...sharedMailAccountFields,
  provider: z.literal("other"),
  username: z.string().trim().min(1).max(MAX_EMAIL_LENGTH).optional(),
  smtpHost: z.string().trim().min(1).max(MAX_HOST_LENGTH),
  smtpPort: z.number().int().min(1).max(65535),
  smtpSecurity: z.enum(MAIL_SECURITY),
});

export const mailSettingsRequestSchema = z.discriminatedUnion("provider", [
  presetMailAccountSchema,
  customMailServerSchema,
]);
