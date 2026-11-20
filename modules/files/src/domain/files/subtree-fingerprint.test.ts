// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { subtreeFingerprint } from "./subtree-fingerprint.js";

const entry = (overrides: Partial<FileRecord>): FileRecord => ({
  fileId: "11111111-1111-4111-8111-111111111111",
  driveId: "22222222-2222-4222-8222-222222222222",
  parentId: null,
  name: "Holiday",
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 1,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
  deletedAt: null,
  ...overrides,
});

describe("subtreeFingerprint", () => {
  it("is the same for the same entries in any order", () => {
    const first = entry({ fileId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" });
    const second = entry({ fileId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Beach" });

    expect(subtreeFingerprint([first, second])).toEqual(subtreeFingerprint([second, first]));
  });

  it("changes when a name, a version or a parent changes", () => {
    const base = subtreeFingerprint([entry({})]);

    expect(subtreeFingerprint([entry({ name: "Summer" })])).not.toEqual(base);
    expect(subtreeFingerprint([entry({ version: 2 })])).not.toEqual(base);
    expect(
      subtreeFingerprint([entry({ parentId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" })]),
    ).not.toEqual(base);
  });
});
