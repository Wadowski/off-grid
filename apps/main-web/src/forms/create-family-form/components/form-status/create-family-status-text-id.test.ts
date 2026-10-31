// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFamilyStatusTextId } from "./create-family-status-text-id.js";

describe("createFamilyStatusTextId", () => {
  it("names the failure message when the family could not be created", () => {
    expect(createFamilyStatusTextId("failed")).toBe("families.createFailed");
  });

  it("shows no status message while idle or submitting", () => {
    expect(createFamilyStatusTextId("idle")).toBeUndefined();
    expect(createFamilyStatusTextId("submitting")).toBeUndefined();
  });
});
