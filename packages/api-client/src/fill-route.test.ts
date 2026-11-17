// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { fillRoute } from "./fill-route.js";

describe("fillRoute", () => {
  it("replaces every placeholder with its encoded value", () => {
    expect(
      fillRoute("/files/:id/versions/:versionId/content", {
        id: "a/b",
        versionId: "c d",
      }),
    ).toBe("/files/a%2Fb/versions/c%20d/content");
  });

  it("returns a route without placeholders unchanged", () => {
    expect(fillRoute("/drives", {})).toBe("/drives");
  });
});
