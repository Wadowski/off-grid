// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { MailSettingsRequest } from "../../types.js";
import { resolveMailConnection } from "./resolve-mail-connection.js";

describe("resolveMailConnection", () => {
  it("fills in the server details of a preset provider", () => {
    const request: MailSettingsRequest = {
      provider: "gmail",
      email: "anna@gmail.com",
      password: "abcd efgh ijkl mnop",
    };

    expect(resolveMailConnection(request)).toEqual({
      host: "smtp.gmail.com",
      port: 587,
      security: "starttls",
      username: "anna@gmail.com",
      password: "abcdefghijklmnop",
      fromAddress: "anna@gmail.com",
    });
  });

  it("uses the given from address when one is set", () => {
    const request: MailSettingsRequest = {
      provider: "fastmail",
      email: "anna@fastmail.com",
      fromAddress: "offgrid@example.com",
      password: "app-pass",
    };

    expect(resolveMailConnection(request).fromAddress).toBe("offgrid@example.com");
  });

  it("uses the entered server details for a custom provider", () => {
    const request: MailSettingsRequest = {
      provider: "other",
      email: "anna@example.com",
      password: "secret",
      smtpHost: "mail.example.com",
      smtpPort: 2525,
      smtpSecurity: "none",
      username: "anna",
    };

    expect(resolveMailConnection(request)).toEqual({
      host: "mail.example.com",
      port: 2525,
      security: "none",
      username: "anna",
      password: "secret",
      fromAddress: "anna@example.com",
    });
  });
});
