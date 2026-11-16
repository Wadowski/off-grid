// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { ownerOf } from "./link-owner.js";

describe("ownerOf", () => {
  it("owns a link by the family when the caller acts in a family", () => {
    expect(ownerOf({ userId: "u1", familyId: "f1" })).toEqual({ familyId: "f1", userId: null });
  });

  it("owns a link by the user when the caller acts without a family", () => {
    expect(ownerOf({ userId: "u1", familyId: null })).toEqual({ familyId: null, userId: "u1" });
  });
});
