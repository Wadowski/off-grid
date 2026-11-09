// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailProvider, MailSecurity } from "@offgrid/contracts";
import type { TranslationKey } from "./types.js";

export const MAIL_PROVIDER_OPTIONS: readonly {
  value: MailProvider;
  labelTextId: TranslationKey;
}[] = [
  { value: "gmail", labelTextId: "admin.provider.gmail" },
  { value: "icloud", labelTextId: "admin.provider.icloud" },
  { value: "fastmail", labelTextId: "admin.provider.fastmail" },
  { value: "other", labelTextId: "admin.provider.other" },
];

export const MAIL_SECURITY_OPTIONS: readonly {
  value: MailSecurity;
  labelTextId: TranslationKey;
}[] = [
  { value: "tls", labelTextId: "admin.security.tls" },
  { value: "starttls", labelTextId: "admin.security.starttls" },
  { value: "none", labelTextId: "admin.security.none" },
];

const TEST_FAILURE_TEXT_IDS: Readonly<Record<string, TranslationKey>> = {
  MAIL_TEST_AUTH_REJECTED: "admin.testEmailAuthRejected",
  MAIL_TEST_UNREACHABLE: "admin.testEmailUnreachable",
  MAIL_TEST_REJECTED: "admin.testEmailRejected",
};

export const testFailureTextIdOf = (failureCode: string | undefined): TranslationKey =>
  (failureCode === undefined ? undefined : TEST_FAILURE_TEXT_IDS[failureCode]) ??
  "admin.testEmailFailed";
