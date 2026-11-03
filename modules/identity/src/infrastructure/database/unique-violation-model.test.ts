// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { uniqueViolationModel } from "./unique-violation-model.js";

describe("uniqueViolationModel", () => {
  it("returns the model of a unique violation", () => {
    expect(uniqueViolationModel({ code: "P2002", meta: { modelName: "UserAccount" } })).toBe(
      "UserAccount",
    );
  });

  it("returns null for other errors", () => {
    expect(uniqueViolationModel({ code: "P2025", meta: { modelName: "UserAccount" } })).toBeNull();
    expect(uniqueViolationModel(new Error("boom"))).toBeNull();
    expect(uniqueViolationModel(null)).toBeNull();
  });
});
