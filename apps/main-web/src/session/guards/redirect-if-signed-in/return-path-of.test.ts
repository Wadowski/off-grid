// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { returnPathOf } from "./return-path-of.js";

describe("returnPathOf", () => {
  it("returns the page the person asked for", () => {
    expect(returnPathOf({ from: "/settings/password" })).toBe("/settings/password");
  });

  it("falls back to the home page without a usable path", () => {
    expect(returnPathOf(undefined)).toBe("/");
    expect(returnPathOf({ reason: "sessionEnded" })).toBe("/");
  });

  it("refuses paths that leave the app or return to sign-in", () => {
    expect(returnPathOf({ from: "//evil.example" })).toBe("/");
    expect(returnPathOf({ from: "https://evil.example" })).toBe("/");
    expect(returnPathOf({ from: "/sign-in" })).toBe("/");
  });
});
