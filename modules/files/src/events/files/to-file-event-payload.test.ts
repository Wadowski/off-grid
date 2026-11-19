// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { toFileEventPayload } from "./to-file-event-payload.js";

const FILE_ID = "11111111-1111-4111-8111-111111111111";
const DRIVE_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const PARENT_ID = "44444444-4444-4444-8444-444444444444";

const folder = (overrides: Partial<FileRecord> = {}): FileRecord => ({
  fileId: FILE_ID,
  driveId: DRIVE_ID,
  parentId: PARENT_ID,
  name: "Holiday",
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 2,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-02T10:00:00Z"),
  deletedAt: null,
  ...overrides,
});

describe("toFileEventPayload", () => {
  it("maps a folder with its owner and version and no storage data", () => {
    expect(
      toFileEventPayload({ file: folder(), owner: { userId: USER_ID, familyId: null } }),
    ).toEqual({
      fileId: FILE_ID,
      driveId: DRIVE_ID,
      ownerUserId: USER_ID,
      ownerFamilyId: null,
      parentId: PARENT_ID,
      isFolder: true,
      name: "Holiday",
      size: null,
      currentVersionId: null,
      deletedAt: null,
      version: 2,
    });
  });

  it("maps a size and a trash time as numbers and ISO text", () => {
    const payload = toFileEventPayload({
      file: folder({
        isFolder: false,
        sizeBytes: 2048n,
        currentVersionId: "55555555-5555-4555-8555-555555555555",
        deletedAt: new Date("2026-11-03T10:00:00Z"),
      }),
      owner: { userId: null, familyId: "66666666-6666-4666-8666-666666666666" },
    });
    expect(payload.size).toBe(2048);
    expect(payload.deletedAt).toBe("2026-11-03T10:00:00.000Z");
    expect(payload.ownerUserId).toBeNull();
  });
});
