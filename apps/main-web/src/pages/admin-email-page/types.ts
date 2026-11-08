// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailProvider, MailSecurity } from "@offgrid/contracts";
import type { ParseKeys } from "i18next";

export type MailFormState = {
  readonly provider: MailProvider;
  readonly email: string;
  readonly password: string;
  readonly smtpHost: string;
  readonly smtpPort: string;
  readonly smtpSecurity: MailSecurity;
};

export type TranslationKey = ParseKeys;
