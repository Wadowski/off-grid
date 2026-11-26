// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { UploadTarget } from "../types.js";
import { createCheckedUploadItem } from "./create-checked-upload-item.js";

const TARGET: UploadTarget = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as UploadTarget["driveId"],
  folderId: null,
};

describe("createCheckedUploadItem", () => {
  it("creates a queued item with its file when the file is within the limit", () => {
    const file = new File(["abc"], "a.txt");

    expect(createCheckedUploadItem("id-a", file, TARGET, "family-1", null, 3)).toMatchObject({
      status: "queued",
      errorTextId: null,
      file,
    });
  });

  it("creates a failed item without a file when the file is above the limit", () => {
    const file = new File(["abcd"], "big.txt");

    expect(createCheckedUploadItem("id-big", file, TARGET, "family-1", null, 3)).toMatchObject({
      name: "big.txt",
      status: "failed",
      errorTextId: "files.errors.payloadTooLarge",
      file: null,
    });
  });

  it("creates a queued item while the limit is unknown", () => {
    const file = new File(["abcd"], "big.txt");

    expect(createCheckedUploadItem("id-big", file, TARGET, "family-1", null, null)).toMatchObject({
      status: "queued",
      file,
    });
  });
});
