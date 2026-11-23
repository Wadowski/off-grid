// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { breadcrumbSchema, driveIdSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileBackTarget } from "./to-file-back-target.js";

const DRIVE_ID = driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const SUMMER_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const FILE_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";

const crumbs = (...entries: readonly unknown[]) =>
  entries.map((entry) => breadcrumbSchema.parse(entry));

describe("toFileBackTarget", () => {
  it("points back to the folder that holds a nested file", () => {
    const breadcrumbs = crumbs(
      { kind: "drive", id: DRIVE_ID, name: "Personal" },
      { kind: "folder", id: PHOTOS_ID, name: "Photos" },
      { kind: "folder", id: SUMMER_ID, name: "Summer" },
      { kind: "folder", id: FILE_ID, name: "Beach.jpg" },
    );

    expect(toFileBackTarget(DRIVE_ID, breadcrumbs)).toEqual({
      to: `/files/${DRIVE_ID}/folder/${SUMMER_ID}`,
      name: "Summer",
    });
  });

  it("points back to the drive root for a file at the drive root", () => {
    const breadcrumbs = crumbs(
      { kind: "drive", id: DRIVE_ID, name: "Personal" },
      { kind: "folder", id: FILE_ID, name: "Notes.txt" },
    );

    expect(toFileBackTarget(DRIVE_ID, breadcrumbs)).toEqual({
      to: `/files/${DRIVE_ID}/folder`,
      name: "Personal",
    });
  });

  it("has no target when the path has no parent", () => {
    const breadcrumbs = crumbs({ kind: "folder", id: FILE_ID, name: "Notes.txt" });

    expect(toFileBackTarget(DRIVE_ID, breadcrumbs)).toBeNull();
  });
});
