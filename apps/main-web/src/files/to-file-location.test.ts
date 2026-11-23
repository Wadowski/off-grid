// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { breadcrumbSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileLocation } from "./to-file-location.js";

describe("toFileLocation", () => {
  it("lists the drive and the folders that hold the file", () => {
    const breadcrumbs = [
      { kind: "drive", id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d", name: "Personal" },
      { kind: "folder", id: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a", name: "Photos" },
      { kind: "folder", id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d", name: "Summer" },
    ].map((crumb) => breadcrumbSchema.parse(crumb));

    expect(toFileLocation(breadcrumbs)).toEqual(["Personal", "Photos", "Summer"]);
  });

  it("lists only the drive for a file at the drive root", () => {
    const breadcrumbs = [
      { kind: "drive", id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d", name: "Personal" },
    ].map((crumb) => breadcrumbSchema.parse(crumb));

    expect(toFileLocation(breadcrumbs)).toEqual(["Personal"]);
  });
});
