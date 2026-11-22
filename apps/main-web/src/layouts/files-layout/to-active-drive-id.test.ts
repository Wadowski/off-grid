// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema, driveSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toActiveDriveId } from "./to-active-drive-id.js";

const PERSONAL = driveSchema.parse({
  id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
});
const FAMILY = driveSchema.parse({
  id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  familyId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "The Smiths",
  createdAt: "2026-01-02T00:00:00.000Z",
});
const UNLISTED_ID = driveIdSchema.parse("0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e");

describe("toActiveDriveId", () => {
  it("returns the drive named in the route", () => {
    expect(toActiveDriveId(FAMILY.id, [PERSONAL, FAMILY])).toBe(FAMILY.id);
  });

  it("returns the route drive even when it is not in the list", () => {
    expect(toActiveDriveId(UNLISTED_ID, [PERSONAL, FAMILY])).toBe(UNLISTED_ID);
  });

  it("returns the personal drive on the Files index", () => {
    expect(toActiveDriveId(undefined, [FAMILY, PERSONAL])).toBe(PERSONAL.id);
  });

  it("returns null on the Files index when no drives are loaded", () => {
    expect(toActiveDriveId(undefined, [])).toBeNull();
  });

  it("returns null on the Files index when only family drives are listed", () => {
    expect(toActiveDriveId(undefined, [FAMILY])).toBeNull();
  });
});
