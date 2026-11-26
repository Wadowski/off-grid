// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toTrashRowValues } from "./to-trash-row-values.js";
import type { FileListItem } from "./types.js";

const BASE = {
  id: "item-1",
  driveId: "drive-1",
  parentId: null,
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  deletedAt: "2026-01-03T00:00:00.000Z",
};

describe("toTrashRowValues", () => {
  it("shows the day a file was deleted and its size", () => {
    const values = toTrashRowValues({
      ...BASE,
      name: "Old receipt.pdf",
      isFolder: false,
      mimeType: "application/pdf",
      size: 2048,
    } as FileListItem);

    expect(values).toMatchObject({ name: "Old receipt.pdf", kind: "pdf", sizeBytes: 2048 });
    expect(values.modifiedAt).toEqual(new Date("2026-01-03T00:00:00.000Z"));
  });

  it("shows the day a folder was deleted and its item count", () => {
    const values = toTrashRowValues({
      ...BASE,
      name: "Holiday",
      isFolder: true,
      itemCount: 3,
    } as FileListItem);

    expect(values).toMatchObject({ name: "Holiday", kind: "folder", itemCount: 3 });
    expect(values.modifiedAt).toEqual(new Date("2026-01-03T00:00:00.000Z"));
  });
});
