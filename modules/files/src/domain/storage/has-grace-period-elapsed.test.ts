// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { hasGracePeriodElapsed } from "./has-grace-period-elapsed.js";

const GRACE_MS = 60 * 60 * 1000;
const NOW = new Date("2026-12-01T12:00:00Z");

describe("hasGracePeriodElapsed", () => {
  it("is false for an object written less than the grace period ago", () => {
    expect(hasGracePeriodElapsed(new Date(NOW.getTime() - GRACE_MS + 1), NOW, GRACE_MS)).toBe(false);
  });

  it("is true once the grace period has passed, including at the exact boundary", () => {
    expect(hasGracePeriodElapsed(new Date(NOW.getTime() - GRACE_MS), NOW, GRACE_MS)).toBe(true);
    expect(hasGracePeriodElapsed(new Date(NOW.getTime() - GRACE_MS - 1), NOW, GRACE_MS)).toBe(true);
  });
});
