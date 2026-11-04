// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAIL_PROVIDER_BY_DOMAIN } from "./constants.js";
import type { MailProvider } from "./types.js";

export const guessMailProvider = (email: string): MailProvider => {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return MAIL_PROVIDER_BY_DOMAIN.get(domain) ?? "other";
};
