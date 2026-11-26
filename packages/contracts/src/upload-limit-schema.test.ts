// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { uploadLimitSchema } from "./upload-limit-schema.js";

describe("uploadLimitSchema", () => {
  it("accepts a whole number of bytes", () => {
    expect(uploadLimitSchema.parse({ maxUploadBytes: 53687091200 })).toEqual({
      maxUploadBytes: 53687091200,
    });
  });

  it("rejects a negative or fractional limit", () => {
    expect(uploadLimitSchema.safeParse({ maxUploadBytes: -1 }).success).toBe(false);
    expect(uploadLimitSchema.safeParse({ maxUploadBytes: 1.5 }).success).toBe(false);
  });

  it("rejects a missing limit", () => {
    expect(uploadLimitSchema.safeParse({}).success).toBe(false);
  });
});
