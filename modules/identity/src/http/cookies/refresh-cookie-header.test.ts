// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { refreshCookieHeader } from "./refresh-cookie-header.js";

const EXPIRES_AT = new Date("2026-11-02T12:00:00.000Z");

describe("refreshCookieHeader", () => {
  it("sets an HttpOnly, SameSite=Strict cookie limited to the auth path", () => {
    expect(refreshCookieHeader("token-value", EXPIRES_AT, false)).toBe(
      "offgrid_refresh=token-value; Path=/api/auth; Expires=Mon, 02 Nov 2026 12:00:00 GMT; HttpOnly; SameSite=Strict",
    );
  });

  it("adds Secure when the request arrived over HTTPS", () => {
    expect(refreshCookieHeader("token-value", EXPIRES_AT, true)).toMatch(/; Secure$/);
  });
});
