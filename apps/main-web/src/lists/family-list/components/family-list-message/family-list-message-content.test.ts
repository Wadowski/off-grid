// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FamilySummary } from "../../../../types.js";
import { familyListMessageContent } from "./family-list-message-content.js";

const FAMILY: FamilySummary = { id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f", name: "Lakeside" };

describe("familyListMessageContent", () => {
  it("shows the loading message while the first list request is pending", () => {
    expect(familyListMessageContent([], "loading")).toEqual({
      variant: "status",
      textId: "families.loading",
      role: "status",
    });
  });

  it("shows the failure as an alert when the list cannot be loaded", () => {
    expect(familyListMessageContent([], "failed")).toEqual({
      variant: "error",
      textId: "families.listFailed",
      role: "alert",
    });
  });

  it("shows the empty message when the caller is in no family", () => {
    expect(familyListMessageContent([], "ready")).toEqual({
      variant: "status",
      textId: "families.empty",
      testId: "family-list-empty",
    });
  });

  it("shows no message once families are loaded", () => {
    expect(familyListMessageContent([FAMILY], "ready")).toBeUndefined();
  });
});
