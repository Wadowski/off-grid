// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailSettingsRequest } from "@offgrid/contracts";
import type { MailFormState } from "./types.js";

export const buildMailRequest = (form: MailFormState): MailSettingsRequest => {
  const account = { email: form.email.trim(), password: form.password };
  if (form.provider !== "other") {
    return { ...account, provider: form.provider };
  }
  return {
    ...account,
    provider: "other",
    smtpHost: form.smtpHost.trim(),
    smtpPort: Number(form.smtpPort),
    smtpSecurity: form.smtpSecurity,
  };
};
