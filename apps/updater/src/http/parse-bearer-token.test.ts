// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { parseBearerToken } from "./parse-bearer-token.js";

describe("parseBearerToken", () => {
  it("returns the token after the Bearer scheme", () => {
    expect(parseBearerToken("Bearer abc123")).toBe("abc123");
  });

  it.each([
    ["no header", undefined],
    ["another scheme", "Basic abc123"],
    ["a scheme without a token", "Bearer "],
    ["a lowercase scheme", "bearer abc123"],
  ])("returns null for %s", (_label, header) => {
    expect(parseBearerToken(header)).toBeNull();
  });
});
