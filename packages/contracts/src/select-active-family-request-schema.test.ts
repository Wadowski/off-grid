// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { selectActiveFamilyRequestSchema } from "./select-active-family-request-schema.js";

describe("selectActiveFamilyRequestSchema", () => {
  it("accepts a family id", () => {
    const familyId = randomUUID();

    expect(selectActiveFamilyRequestSchema.parse({ familyId })).toEqual({ familyId });
  });

  it("rejects a value that is not a family id", () => {
    expect(selectActiveFamilyRequestSchema.safeParse({ familyId: "cabin" }).success).toBe(false);
  });

  it("rejects a request with no family id", () => {
    expect(selectActiveFamilyRequestSchema.safeParse({}).success).toBe(false);
  });
});
