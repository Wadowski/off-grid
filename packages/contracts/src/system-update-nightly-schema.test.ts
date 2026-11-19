// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { systemUpdateNightlySchema } from "./system-update-nightly-schema.js";

describe("systemUpdateNightlySchema", () => {
  it("accepts an enabled and a disabled setting", () => {
    expect(systemUpdateNightlySchema.parse({ enabled: true })).toEqual({ enabled: true });
    expect(systemUpdateNightlySchema.parse({ enabled: false })).toEqual({ enabled: false });
  });

  it("rejects a value that is not a boolean", () => {
    expect(systemUpdateNightlySchema.safeParse({ enabled: "yes" }).success).toBe(false);
  });

  it("rejects an empty body", () => {
    expect(systemUpdateNightlySchema.safeParse({}).success).toBe(false);
  });

  it("rejects keys beyond enabled", () => {
    expect(systemUpdateNightlySchema.safeParse({ enabled: true, hour: 3 }).success).toBe(false);
  });
});
