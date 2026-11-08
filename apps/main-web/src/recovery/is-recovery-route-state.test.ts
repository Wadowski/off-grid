// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isRecoveryRouteState } from "./is-recovery-route-state.js";

describe("isRecoveryRouteState", () => {
  it("accepts an email with either recovery method", () => {
    expect(isRecoveryRouteState({ email: "anna@example.com", method: "recoveryCode" })).toBe(true);
    expect(isRecoveryRouteState({ email: "anna@example.com", method: "emailCode" })).toBe(true);
  });

  it("rejects a visit without the state the forgot page sets", () => {
    expect(isRecoveryRouteState(undefined)).toBe(false);
    expect(isRecoveryRouteState({ email: "anna@example.com" })).toBe(false);
    expect(isRecoveryRouteState({ email: "anna@example.com", method: "multisig" })).toBe(false);
  });
});
