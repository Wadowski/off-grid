// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { planCopyTree } from "./plan-copy-tree.js";

const TARGET_PARENT = "99999999-9999-4999-8999-999999999999";
const SOURCE_PARENT = "88888888-8888-4888-8888-888888888888";

const entry = (fileId: string, parentId: string | null): FileRecord => ({
  fileId,
  driveId: "77777777-7777-4777-8777-777777777777",
  parentId,
  name: fileId,
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 1,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
  deletedAt: null,
});

const idSequence = () => {
  let next = 0;
  return () => {
    next += 1;
    return `copy-${next}`;
  };
};

describe("planCopyTree", () => {
  it("gives the root the target parent and each child the copy of its source parent", () => {
    const plan = planCopyTree(
      [entry("root", SOURCE_PARENT), entry("child", "root"), entry("grandchild", "child")],
      TARGET_PARENT,
      idSequence(),
    );

    expect(plan).toEqual([
      { sourceFileId: "root", copyFileId: "copy-1", copyParentId: TARGET_PARENT },
      { sourceFileId: "child", copyFileId: "copy-2", copyParentId: "copy-1" },
      { sourceFileId: "grandchild", copyFileId: "copy-3", copyParentId: "copy-2" },
    ]);
  });

  it("puts the root at the drive root when the target parent is null", () => {
    const plan = planCopyTree([entry("root", null)], null, idSequence());

    expect(plan).toEqual([{ sourceFileId: "root", copyFileId: "copy-1", copyParentId: null }]);
  });

  it("uses a new id for every entry, never the source id", () => {
    const plan = planCopyTree([entry("root", null), entry("child", "root")], null, idSequence());

    expect(plan.map((item) => item.copyFileId)).not.toContain("root");
    expect(new Set(plan.map((item) => item.copyFileId)).size).toBe(2);
  });
});
