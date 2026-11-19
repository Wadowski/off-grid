// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { applyMembershipVersion } from "./apply-membership-version.js";
import type { MembershipChange } from "./types.js";

const change = (sourceVersion: number, isMember: boolean): MembershipChange => ({
  familyId: "8f3c2a7e-1d4b-4e6a-9b2c-5d7e8f9a0b1c",
  userId: "2b7e9c1d-3f4a-4b5c-8d6e-7f8a9b0c1d2e",
  sourceVersion,
  isMember,
});

describe("applyMembershipVersion", () => {
  it("makes a member of a first join at version 1", () => {
    expect(applyMembershipVersion(null, change(1, true))).toEqual({ isMember: true });
  });

  it("stores a first event beyond version 1 as not a member", () => {
    expect(applyMembershipVersion(null, change(3, true))).toEqual({ isMember: false });
  });

  it("applies the next version of an existing row", () => {
    expect(applyMembershipVersion({ sourceVersion: 1 }, change(2, false))).toEqual({
      isMember: false,
    });
    expect(applyMembershipVersion({ sourceVersion: 2 }, change(3, true))).toEqual({
      isMember: true,
    });
  });

  it("skips a duplicate version", () => {
    expect(applyMembershipVersion({ sourceVersion: 2 }, change(2, true))).toBe("skip");
  });

  it("skips a stale version", () => {
    expect(applyMembershipVersion({ sourceVersion: 4 }, change(2, true))).toBe("skip");
  });

  it("throws when a version arrives before an earlier one it depends on", () => {
    expect(() => applyMembershipVersion({ sourceVersion: 1 }, change(3, true))).toThrow(
      "arrived before an earlier change",
    );
  });
});
