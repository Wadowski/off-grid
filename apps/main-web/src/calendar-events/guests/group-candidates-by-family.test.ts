// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { groupCandidatesByFamily } from "./group-candidates-by-family.js";

describe("groupCandidatesByFamily", () => {
  it("groups the candidates under the family they share", () => {
    const groups = groupCandidatesByFamily([
      { userId: "ben", name: "Ben", familyId: "family-smiths", familyName: "The Smiths" },
      { userId: "cara", name: undefined, familyId: "family-home", familyName: "Home" },
      { userId: "dan", name: "Dan", familyId: "family-smiths", familyName: "The Smiths" },
    ]);

    expect(groups.map((group) => group.familyName)).toEqual(["The Smiths", "Home"]);
    expect(groups[0]?.candidates.map((candidate) => candidate.userId)).toEqual(["ben", "dan"]);
  });
});
