// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { errorResponseSchema, familyIdSchema, timestampSchema } from "./primitives.js";

const uuid = "0b7e6f0e-3c1a-4d2b-9f5e-8a1c2d3e4f50";

describe("id primitives", () => {
  it("accepts a UUID as a family id", () => {
    expect(familyIdSchema.parse(uuid)).toBe(uuid);
  });

  it("rejects a value that is not a UUID", () => {
    expect(familyIdSchema.safeParse("family-1").success).toBe(false);
  });
});

describe("timestampSchema", () => {
  it("accepts an ISO-8601 instant", () => {
    expect(timestampSchema.safeParse("2026-10-29T12:00:00.000Z").success).toBe(true);
  });

  it("rejects a date without a time", () => {
    expect(timestampSchema.safeParse("2026-10-29").success).toBe(false);
  });
});

describe("errorResponseSchema", () => {
  it("accepts a stable code and a message", () => {
    expect(
      errorResponseSchema.parse({ code: "VALIDATION_FAILED", message: "Name is required." }),
    ).toEqual({ code: "VALIDATION_FAILED", message: "Name is required." });
  });

  it("rejects a code that is not upper snake case", () => {
    expect(
      errorResponseSchema.safeParse({ code: "validation failed", message: "Name is required." })
        .success,
    ).toBe(false);
  });

  it("rejects an empty message", () => {
    expect(errorResponseSchema.safeParse({ code: "NOT_FOUND", message: "" }).success).toBe(false);
  });
});
