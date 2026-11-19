// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemUpdateApplyResultSchema } from "./system-update-apply-result-schema.js";

describe("systemUpdateApplyResultSchema", () => {
  it("accepts a started run with its target version", () => {
    expect(systemUpdateApplyResultSchema.parse({ started: true, targetVersion: "1.5.0" })).toEqual({
      started: true,
      targetVersion: "1.5.0",
    });
  });

  it("rejects a run that is not started", () => {
    expect(
      systemUpdateApplyResultSchema.safeParse({ started: false, targetVersion: "1.5.0" }).success,
    ).toBe(false);
  });

  it("rejects a target version that is not a release version", () => {
    expect(
      systemUpdateApplyResultSchema.safeParse({ started: true, targetVersion: "latest" }).success,
    ).toBe(false);
  });
});
