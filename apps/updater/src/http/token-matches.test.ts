// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { tokenMatches } from "./token-matches.js";

describe("tokenMatches", () => {
  it("accepts an equal token", () => {
    expect(tokenMatches("token-value", "token-value")).toBe(true);
  });

  it.each([
    ["a token of another length", "token-value-longer"],
    ["a token with other content", "token-valuX"],
    ["an empty token", ""],
  ])("rejects %s", (_label, presentedToken) => {
    expect(tokenMatches("token-value", presentedToken)).toBe(false);
  });
});
