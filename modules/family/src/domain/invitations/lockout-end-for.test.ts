// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { lockoutEndFor } from "./lockout-end-for.js";

const NOW = new Date(1_000_000);

describe("lockoutEndFor", () => {
  it("returns no lockout below the failure limit", () => {
    const belowLimit = INVITATION_ATTEMPT_POLICY.limit - 1;

    expect(lockoutEndFor(belowLimit, INVITATION_ATTEMPT_POLICY, NOW)).toBeNull();
  });

  it("returns the lockout end at the failure limit", () => {
    expect(lockoutEndFor(INVITATION_ATTEMPT_POLICY.limit, INVITATION_ATTEMPT_POLICY, NOW)).toEqual(
      new Date(NOW.getTime() + INVITATION_ATTEMPT_POLICY.lockoutMs),
    );
  });
});
