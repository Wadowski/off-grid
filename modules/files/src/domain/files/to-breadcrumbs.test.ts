// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { DriveRecord, FileRecord } from "../../types.js";
import { toBreadcrumbs } from "./to-breadcrumbs.js";

const DRIVE: DriveRecord = {
  driveId: "11111111-1111-4111-8111-111111111111",
  userId: "55555555-5555-4555-8555-555555555555",
  familyId: null,
  name: "Personal",
  createdAt: new Date("2026-11-01T10:00:00Z"),
};

const folder = (fileId: string, name: string): FileRecord => ({
  fileId,
  driveId: DRIVE.driveId,
  parentId: null,
  name,
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 1,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
  deletedAt: null,
});

describe("toBreadcrumbs", () => {
  it("gives only the drive crumb at the drive root", () => {
    expect(toBreadcrumbs(DRIVE, [])).toEqual([
      { kind: "drive", id: DRIVE.driveId, name: "Personal" },
    ]);
  });

  it("starts with the drive and then lists the folders in order", () => {
    const path = [
      folder("22222222-2222-4222-8222-222222222222", "Holiday"),
      folder("33333333-3333-4333-8333-333333333333", "Beach"),
    ];

    expect(toBreadcrumbs(DRIVE, path)).toEqual([
      { kind: "drive", id: DRIVE.driveId, name: "Personal" },
      { kind: "folder", id: "22222222-2222-4222-8222-222222222222", name: "Holiday" },
      { kind: "folder", id: "33333333-3333-4333-8333-333333333333", name: "Beach" },
    ]);
  });
});
