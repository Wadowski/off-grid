// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { readRefreshTokenFromCookie } from "./read-refresh-token-from-cookie.js";

describe("readRefreshTokenFromCookie", () => {
  it("finds the refresh cookie among other cookies", () => {
    expect(readRefreshTokenFromCookie("theme=dark; offgrid_refresh=abc_DEF-123; lang=en")).toBe(
      "abc_DEF-123",
    );
  });

  it("returns null when the cookie is absent or the header is missing", () => {
    expect(readRefreshTokenFromCookie("theme=dark")).toBeNull();
    expect(readRefreshTokenFromCookie(undefined)).toBeNull();
  });
});
