// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { toChildrenPage } from "./to-children-page.js";

const entry = (fileId: string, name: string): FileRecord => ({
  fileId,
  driveId: "11111111-1111-4111-8111-111111111111",
  parentId: null,
  name,
  isFolder: false,
  mimeType: "text/plain",
  sizeBytes: 3n,
  currentVersionId: "44444444-4444-4444-8444-444444444444",
  version: 1,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
  deletedAt: null,
});

describe("toChildrenPage", () => {
  it("returns no next cursor when every row fits on the page", () => {
    const page = toChildrenPage([entry("a", "a.txt")], 2);

    expect(page.records.map((record) => record.name)).toEqual(["a.txt"]);
    expect(page.nextCursor).toBeNull();
  });

  it("drops the extra row and points the next cursor at the last row on the page", () => {
    const page = toChildrenPage(
      [
        entry("22222222-2222-4222-8222-222222222222", "a.txt"),
        entry("33333333-3333-4333-8333-333333333333", "b.txt"),
        entry("55555555-5555-4555-8555-555555555555", "c.txt"),
      ],
      2,
    );

    expect(page.records.map((record) => record.name)).toEqual(["a.txt", "b.txt"]);
    expect(page.nextCursor).toEqual({
      isFolder: false,
      name: "b.txt",
      fileId: "33333333-3333-4333-8333-333333333333",
    });
  });

  it("returns an empty page with no cursor for an empty folder", () => {
    expect(toChildrenPage([], 50)).toEqual({ records: [], nextCursor: null });
  });
});
