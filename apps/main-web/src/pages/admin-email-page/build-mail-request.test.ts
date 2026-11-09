// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { buildMailRequest } from "./build-mail-request.js";
import type { MailFormState } from "./types.js";

const form: MailFormState = {
  provider: "gmail",
  email: " anna@gmail.com ",
  password: "app password",
  smtpHost: "",
  smtpPort: "",
  smtpSecurity: "starttls",
};

describe("buildMailRequest", () => {
  it("sends only the address and app password for a known provider", () => {
    expect(buildMailRequest(form)).toEqual({
      provider: "gmail",
      email: "anna@gmail.com",
      password: "app password",
    });
  });

  it("adds the server details for the other provider", () => {
    expect(
      buildMailRequest({
        ...form,
        provider: "other",
        smtpHost: " smtp.example.org ",
        smtpPort: "587",
        smtpSecurity: "tls",
      }),
    ).toEqual({
      provider: "other",
      email: "anna@gmail.com",
      password: "app password",
      smtpHost: "smtp.example.org",
      smtpPort: 587,
      smtpSecurity: "tls",
    });
  });
});
