// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyIdSchema, familyMemberSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileAccessEntries } from "./to-file-access-entries.js";

const ANNA_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const BEN_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const FAMILY_ID = familyIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");

const viewer = { id: ANNA_ID, displayName: "Anna" };

describe("toFileAccessEntries", () => {
  it("lists only the owner for a personal drive", () => {
    expect(toFileAccessEntries({ familyId: null }, [], viewer)).toEqual([
      { userId: ANNA_ID, name: "Anna", role: "owner" },
    ]);
  });

  it("lists every family member with their role for a family drive", () => {
    const members = [
      familyMemberSchema.parse({
        userId: ANNA_ID,
        displayName: "Anna",
        role: "admin",
        joinedAt: "2026-01-01T00:00:00.000Z",
      }),
      familyMemberSchema.parse({
        userId: BEN_ID,
        displayName: null,
        role: "member",
        joinedAt: "2026-01-01T00:00:00.000Z",
      }),
    ];

    expect(toFileAccessEntries({ familyId: FAMILY_ID }, members, viewer)).toEqual([
      { userId: ANNA_ID, name: "Anna", role: "admin" },
      { userId: BEN_ID, name: null, role: "member" },
    ]);
  });
});
