// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { driveSchema } from "./drive-schema.js";

const DRIVE_ID = "11111111-1111-4111-8111-111111111111";
const FAMILY_ID = "33333333-3333-4333-8333-333333333333";
const CREATED_AT = "2026-11-01T10:00:00.000Z";

describe("driveSchema", () => {
  it("accepts a personal drive with its name and a null family", () => {
    expect(
      driveSchema.parse({ id: DRIVE_ID, familyId: null, name: "Personal", createdAt: CREATED_AT }),
    ).toEqual({ id: DRIVE_ID, familyId: null, name: "Personal", createdAt: CREATED_AT });
  });

  it("requires a name", () => {
    expect(() =>
      driveSchema.parse({ id: DRIVE_ID, familyId: FAMILY_ID, createdAt: CREATED_AT }),
    ).toThrow();
  });
});
