// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { planPurgeBatches } from "./plan-purge-batches.js";

const entry = (fileId: string): FileRecord => ({
  fileId,
  driveId: "d",
  parentId: null,
  name: fileId,
  isFolder: false,
  mimeType: "text/plain",
  sizeBytes: 0n,
  currentVersionId: null,
  version: 1,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  deletedAt: new Date(0),
});

describe("planPurgeBatches", () => {
  it("returns no batches for an empty subtree", () => {
    expect(planPurgeBatches([], 2)).toEqual([]);
  });

  it("puts the deepest entries first and the root, listed first in breadth-first order, last", () => {
    const subtree = ["root", "childA", "childB", "grandchild"].map(entry);

    const batches = planPurgeBatches(subtree, 10);

    expect(batches.flat().map((file) => file.fileId)).toEqual([
      "grandchild",
      "childB",
      "childA",
      "root",
    ]);
  });

  it("chunks the entries by the batch size", () => {
    const subtree = ["root", "a", "b", "c", "d"].map(entry);

    const batches = planPurgeBatches(subtree, 2);

    expect(batches.map((batch) => batch.map((file) => file.fileId))).toEqual([
      ["d", "c"],
      ["b", "a"],
      ["root"],
    ]);
  });
});
