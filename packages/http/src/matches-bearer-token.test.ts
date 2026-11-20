// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { matchesBearerToken } from "./matches-bearer-token.js";

const EXPECTED_TOKEN = "token-value";

describe("matchesBearerToken", () => {
  it("accepts the expected token in a Bearer header", () => {
    expect(matchesBearerToken(EXPECTED_TOKEN, `Bearer ${EXPECTED_TOKEN}`)).toBe(true);
  });

  it.each([
    ["a token of another length", `Bearer ${EXPECTED_TOKEN}-longer`],
    ["a token with other content", "Bearer token-valuX"],
    ["a scheme without a token", "Bearer "],
    ["another scheme", `Basic ${EXPECTED_TOKEN}`],
    ["a lowercase scheme", `bearer ${EXPECTED_TOKEN}`],
    ["a header without a scheme", EXPECTED_TOKEN],
    ["no header", undefined],
  ])("rejects %s", (_label, header) => {
    expect(matchesBearerToken(EXPECTED_TOKEN, header)).toBe(false);
  });
});
