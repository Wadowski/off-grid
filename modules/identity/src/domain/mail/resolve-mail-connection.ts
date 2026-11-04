// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAIL_PRESETS } from "@offgrid/contracts";
import type { MailSettingsRequest, MailConnection } from "../../types.js";
import { normalizeAppPassword } from "./normalize-app-password.js";

export const resolveMailConnection = (request: MailSettingsRequest): MailConnection => {
  const password = normalizeAppPassword(request.provider, request.password);
  const fromAddress = request.fromAddress ?? request.email;
  if (request.provider === "other") {
    return {
      host: request.smtpHost,
      port: request.smtpPort,
      security: request.smtpSecurity,
      username: request.username ?? request.email,
      password,
      fromAddress,
    };
  }
  const preset = MAIL_PRESETS[request.provider];
  return {
    host: preset.host,
    port: preset.port,
    security: preset.security,
    username: request.email,
    password,
    fromAddress,
  };
};
