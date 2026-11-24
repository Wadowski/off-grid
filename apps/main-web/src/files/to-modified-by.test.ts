// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileVersionIdSchema, fileVersionSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toModifiedBy } from "./to-modified-by.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const ANNA_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const BEN_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";
const FIRST_VERSION_ID = fileVersionIdSchema.parse("8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c20");
const CURRENT_VERSION_ID = fileVersionIdSchema.parse("8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c21");

const versions = [
  fileVersionSchema.parse({
    id: FIRST_VERSION_ID,
    fileId: FILE_ID,
    number: 1,
    size: 100,
    mimeType: "application/pdf",
    createdByUserId: ANNA_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
  }),
  fileVersionSchema.parse({
    id: CURRENT_VERSION_ID,
    fileId: FILE_ID,
    number: 2,
    size: 120,
    mimeType: "application/pdf",
    createdByUserId: BEN_ID,
    createdAt: "2026-01-02T00:00:00.000Z",
  }),
];

describe("toModifiedBy", () => {
  it("names who saved the current version", () => {
    expect(toModifiedBy(CURRENT_VERSION_ID, versions, () => "Ben")).toBe("Ben");
  });

  it("has no name when the author cannot be resolved", () => {
    expect(toModifiedBy(CURRENT_VERSION_ID, versions, () => null)).toBeNull();
  });

  it("has no name when the current version is not in the list", () => {
    expect(toModifiedBy(FIRST_VERSION_ID, [], () => "Anna")).toBeNull();
  });
});
