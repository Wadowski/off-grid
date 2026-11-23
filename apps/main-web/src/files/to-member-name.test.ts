// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toMemberName } from "./to-member-name.js";

const BEN_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const ANNA_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const GONE_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";

const members = [
  familyMemberSchema.parse({
    userId: BEN_ID,
    displayName: "Ben",
    role: "member",
    joinedAt: "2026-01-01T00:00:00.000Z",
  }),
  familyMemberSchema.parse({
    userId: ANNA_ID,
    displayName: null,
    role: "admin",
    joinedAt: "2026-01-01T00:00:00.000Z",
  }),
];
const viewer = { id: ANNA_ID, displayName: "Anna" };

describe("toMemberName", () => {
  it("resolves a family member to the name they share", () => {
    expect(toMemberName(BEN_ID, members, null)).toBe("Ben");
  });

  it("resolves the signed-in person to their own display name", () => {
    expect(toMemberName(ANNA_ID, [], viewer)).toBe("Anna");
  });

  it("has no name for a person who is not a member", () => {
    expect(toMemberName(GONE_ID, members, viewer)).toBeNull();
  });

  it("has no name for a member who has no display name", () => {
    expect(toMemberName(ANNA_ID, members, null)).toBeNull();
  });
});
