// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { guestNameOf } from "./guest-names.js";

const candidates = [
  { userId: "ben", name: "Ben", familyId: "family-smiths", familyName: "The Smiths" },
];

describe("guestNameOf", () => {
  it("returns the name of a known candidate", () => {
    expect(guestNameOf(candidates, "ben")).toBe("Ben");
  });

  it("returns undefined for a guest outside the known candidates", () => {
    expect(guestNameOf(candidates, "dan")).toBeUndefined();
  });
});
