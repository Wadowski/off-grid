// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { PasswordResetRecord } from "../../types.js";
import { isUsablePasswordReset } from "./is-usable-password-reset.js";

const NOW = new Date("2026-11-02T12:00:00Z");

const reset = (overrides: Partial<PasswordResetRecord> = {}): PasswordResetRecord => ({
  passwordResetId: "1",
  userId: "2",
  expiresAt: new Date(NOW.getTime() + 60_000),
  usedAt: null,
  retiredAt: null,
  ...overrides,
});

describe("isUsablePasswordReset", () => {
  it("accepts an unused, unretired code before it expires", () => {
    expect(isUsablePasswordReset(reset(), NOW)).toBe(true);
  });

  it("refuses a used code", () => {
    expect(isUsablePasswordReset(reset({ usedAt: NOW }), NOW)).toBe(false);
  });

  it("refuses a retired code", () => {
    expect(isUsablePasswordReset(reset({ retiredAt: NOW }), NOW)).toBe(false);
  });

  it("refuses a code at or after its expiry", () => {
    expect(isUsablePasswordReset(reset({ expiresAt: NOW }), NOW)).toBe(false);
  });
});
