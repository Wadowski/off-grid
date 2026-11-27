// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toIsCrossOwnerTarget } from "./to-is-cross-owner-target.js";
import type { Drive } from "./types.js";

const driveId = (value: string) => value as Drive["id"];

const PERSONAL = { id: driveId("p"), familyId: null, name: "Personal" } as Drive;
const HOME = { id: driveId("h"), familyId: "f1", name: "Home" } as Drive;
const OTHER_FAMILY = { id: driveId("o"), familyId: "f2", name: "Other" } as Drive;
const DRIVES = [PERSONAL, HOME, OTHER_FAMILY];

describe("toIsCrossOwnerTarget", () => {
  it("is true when the target drive belongs to another owner", () => {
    expect(toIsCrossOwnerTarget(DRIVES, driveId("p"), driveId("h"))).toBe(true);
    expect(toIsCrossOwnerTarget(DRIVES, driveId("h"), driveId("p"))).toBe(true);
  });

  it("is false within the same owner", () => {
    expect(toIsCrossOwnerTarget(DRIVES, driveId("h"), driveId("h"))).toBe(false);
    expect(toIsCrossOwnerTarget(DRIVES, driveId("p"), driveId("p"))).toBe(false);
  });

  it("is false when a drive is unknown", () => {
    expect(toIsCrossOwnerTarget(DRIVES, driveId("p"), driveId("missing"))).toBe(false);
  });
});
