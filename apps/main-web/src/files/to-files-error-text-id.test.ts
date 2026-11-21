// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { filesErrorCodeSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";

const EXPECTED_TEXT_IDS = {
  NOT_FOUND: "files.errors.notFound",
  VALIDATION_FAILED: "files.errors.validationFailed",
  UNAUTHENTICATED: "files.errors.unauthenticated",
  NAME_TAKEN: "files.errors.nameTaken",
  INVALID_MOVE: "files.errors.invalidMove",
  NOT_TRASHED: "files.errors.notTrashed",
  IS_FOLDER: "files.errors.isFolder",
  UPLOAD_INCOMPLETE: "files.errors.uploadIncomplete",
  UPLOAD_OFFSET_MISMATCH: "files.errors.uploadOffsetMismatch",
} as const;

describe("toFilesErrorTextId", () => {
  it.each(filesErrorCodeSchema.options)("maps the %s code to its text", (code) => {
    expect(toFilesErrorTextId(new ApiError(400, code, "refused"))).toBe(EXPECTED_TEXT_IDS[code]);
  });

  it("maps a 404 without a known code to not found", () => {
    expect(toFilesErrorTextId(new ApiError(404, "", "missing"))).toBe("files.errors.notFound");
  });

  it("maps a server error without a known code to failed", () => {
    expect(toFilesErrorTextId(new ApiError(500, "INTERNAL", "boom"))).toBe("files.errors.failed");
  });

  it("maps a network failure to failed", () => {
    expect(toFilesErrorTextId(new TypeError("Failed to fetch"))).toBe("files.errors.failed");
  });
});
