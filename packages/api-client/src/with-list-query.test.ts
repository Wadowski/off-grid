// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { withListQuery } from "./with-list-query.js";

describe("withListQuery", () => {
  it("leaves the path alone when no option is set", () => {
    expect(withListQuery("/drives/d/children", {})).toBe("/drives/d/children");
  });

  it("adds the cursor and limit as encoded query parameters", () => {
    expect(withListQuery("/drives/d/children", { cursor: "a+b c", limit: 50 })).toBe(
      "/drives/d/children?cursor=a%2Bb+c&limit=50",
    );
  });

  it("adds the sort field and direction", () => {
    expect(withListQuery("/files/f/children", { sort: "modified", direction: "desc" })).toBe(
      "/files/f/children?sort=modified&direction=desc",
    );
  });
});
