// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { breadcrumbSchema } from "./breadcrumb-schema.js";

const DRIVE_ID = "11111111-1111-4111-8111-111111111111";
const FOLDER_ID = "22222222-2222-4222-8222-222222222222";

describe("breadcrumbSchema", () => {
  it("accepts a drive crumb with the drive id and name", () => {
    expect(breadcrumbSchema.parse({ kind: "drive", id: DRIVE_ID, name: "Personal" })).toEqual({
      kind: "drive",
      id: DRIVE_ID,
      name: "Personal",
    });
  });

  it("accepts a folder crumb with the file id and name", () => {
    expect(breadcrumbSchema.parse({ kind: "folder", id: FOLDER_ID, name: "Photos" })).toEqual({
      kind: "folder",
      id: FOLDER_ID,
      name: "Photos",
    });
  });

  it("rejects a crumb without a kind", () => {
    expect(() => breadcrumbSchema.parse({ id: FOLDER_ID, name: "Photos" })).toThrow();
  });

  it("rejects a drive crumb whose id is not a uuid", () => {
    expect(() => breadcrumbSchema.parse({ kind: "drive", id: "nope", name: "Personal" })).toThrow();
  });
});
