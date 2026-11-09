// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isRedemptionLocked } from "./is-redemption-locked.js";

const NOW = new Date(1_000_000);

describe("isRedemptionLocked", () => {
  it("is not locked when no lockout is set", () => {
    expect(isRedemptionLocked(null, NOW)).toBe(false);
  });

  it("is locked until the lockout end", () => {
    const lockedUntil = new Date(NOW.getTime() + 1);

    expect(isRedemptionLocked(lockedUntil, NOW)).toBe(true);
    expect(isRedemptionLocked(lockedUntil, lockedUntil)).toBe(false);
  });
});
