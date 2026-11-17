// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemVersionSchema } from "./system-version-schema.js";

describe("systemVersionSchema", () => {
  it("accepts a version without a commit", () => {
    expect(systemVersionSchema.parse({ version: "1.2.3" })).toEqual({ version: "1.2.3" });
  });

  it("accepts a version with a commit", () => {
    expect(systemVersionSchema.parse({ version: "1.2.3", commit: "abc1234" })).toEqual({
      version: "1.2.3",
      commit: "abc1234",
    });
  });

  it("rejects an empty version", () => {
    expect(() => systemVersionSchema.parse({ version: "" })).toThrow();
  });

  it("rejects keys beyond version and commit", () => {
    expect(() => systemVersionSchema.parse({ version: "1.2.3", hostname: "box" })).toThrow();
  });
});
