// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { UploadItem, UploadTarget } from "../types.js";
import { createUploadItem } from "./create-upload-item.js";
import { isRetryableUploadItem } from "./is-retryable-upload-item.js";

const TARGET: UploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadTarget["driveId"],
  folderId: null,
};

const failedItem = (overrides: Partial<UploadItem>): UploadItem => ({
  ...createUploadItem("id-a", new File(["x"], "a.txt"), TARGET, "family-1", null),
  status: "failed",
  errorTextId: "files.errors.failed",
  ...overrides,
});

describe("isRetryableUploadItem", () => {
  it("allows a retry of a failed item that still holds its file in the active family", () => {
    expect(isRetryableUploadItem(failedItem({}), "family-1")).toBe(true);
  });

  it("refuses items that are not failed", () => {
    expect(isRetryableUploadItem(failedItem({ status: "queued" }), "family-1")).toBe(false);
    expect(isRetryableUploadItem(failedItem({ status: "done" }), "family-1")).toBe(false);
  });

  it("refuses an item without its file", () => {
    expect(isRetryableUploadItem(failedItem({ file: null }), "family-1")).toBe(false);
  });

  it("refuses an item from another family", () => {
    expect(isRetryableUploadItem(failedItem({}), "family-2")).toBe(false);
  });

  it.each([
    "files.errors.payloadTooLarge",
    "files.errors.nameTaken",
    "files.errors.notFound",
    "files.errors.validationFailed",
    "files.errors.unauthenticated",
    "files.upload.stoppedFamilySwitch",
  ] as const)("refuses a retry after %s", (errorTextId) => {
    expect(isRetryableUploadItem(failedItem({ errorTextId }), "family-1")).toBe(false);
  });

  it("allows a retry after a generic failure", () => {
    expect(
      isRetryableUploadItem(failedItem({ errorTextId: "files.errors.failed" }), "family-1"),
    ).toBe(true);
  });
});
