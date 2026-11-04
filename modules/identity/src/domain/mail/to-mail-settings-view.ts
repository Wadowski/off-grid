// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailSettingsRecord, MailSettingsView } from "../../types.js";

export const toMailSettingsView = (record: MailSettingsRecord | null): MailSettingsView =>
  record === null
    ? {
        configured: false,
        provider: null,
        fromAddress: null,
        smtpHost: null,
        smtpPort: null,
        smtpSecurity: null,
        username: null,
      }
    : {
        configured: true,
        provider: record.provider,
        fromAddress: record.fromAddress,
        smtpHost: record.smtpHost,
        smtpPort: record.smtpPort,
        smtpSecurity: record.smtpSecurity,
        username: record.username,
      };
