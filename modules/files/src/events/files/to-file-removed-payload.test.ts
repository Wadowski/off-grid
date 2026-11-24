// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { fileRemovedPayloadSchema } from "@offgrid/contracts";
import type { FileRecord } from "../../types.js";
import { toFileRemovedPayload } from "./to-file-removed-payload.js";

const file: FileRecord = {
  fileId: "11111111-1111-4111-8111-111111111111",
  driveId: "22222222-2222-4222-8222-222222222222",
  parentId: null,
  name: "Holiday",
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 3,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-02T10:00:00Z"),
  deletedAt: null,
};

describe("toFileRemovedPayload", () => {
  it("carries ids, owner and version only, and passes the contract schema", () => {
    const payload = toFileRemovedPayload({
      file,
      owner: { userId: "33333333-3333-4333-8333-333333333333", familyId: null },
    });

    expect(payload).toEqual({
      fileId: file.fileId,
      driveId: file.driveId,
      ownerUserId: "33333333-3333-4333-8333-333333333333",
      ownerFamilyId: null,
      version: 4,
    });
    expect(fileRemovedPayloadSchema.safeParse(payload).success).toBe(true);
  });
});
