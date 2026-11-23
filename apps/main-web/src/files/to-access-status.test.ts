// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toAccessStatus } from "./to-access-status.js";
import type { Drive } from "./types.js";

const DRIVE = {
  id: driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d"),
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;

describe("toAccessStatus", () => {
  it("follows the members once the drive is known", () => {
    expect(toAccessStatus(DRIVE, "ready", "failed")).toBe("failed");
    expect(toAccessStatus(DRIVE, "ready", "loading")).toBe("loading");
  });

  it("is loading while the drives are still loading", () => {
    expect(toAccessStatus(null, "loading", "ready")).toBe("loading");
  });

  it("fails when the drives are loaded but the drive is not among them", () => {
    expect(toAccessStatus(null, "ready", "ready")).toBe("failed");
  });
});
