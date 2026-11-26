// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toFolderPickerNodes } from "./to-folder-picker-nodes.js";
import type { Drive, FileListItem, FolderNodeState, MoveSource } from "./types.js";

const PERSONAL = { id: "p", familyId: null, name: "Personal" } as Drive;
const HOME = { id: "h", familyId: "f1", name: "Home" } as Drive;
const folder = (id: string, name: string) => ({ id, name, isFolder: true }) as FileListItem;
const loaded = (folders: FileListItem[]): FolderNodeState =>
  ({ driveId: "p", folderId: null, status: "ready", folders, nextCursor: null, isLoadingMore: false, errorTextId: null }) as FolderNodeState;
const SOURCE: MoveSource = { entryId: "moved", entryName: "Photos", driveId: "p", parentId: "docs" };

describe("toFolderPickerNodes", () => {
  it("lists drives as roots and marks the current location and the other owner", () => {
    const nodes = toFolderPickerNodes([PERSONAL, HOME], {}, SOURCE);

    expect(nodes.map((node) => [node.id, node.isDrive, node.caption])).toEqual([
      ["p", true, null],
      ["h", true, "otherOwner"],
    ]);
  });

  it("marks the folder that holds the entry as the current location", () => {
    const nodes = toFolderPickerNodes([PERSONAL], { p: loaded([folder("docs", "Documents")]) }, SOURCE);
    const documents = nodes[0]?.children?.[0];

    expect(documents).toMatchObject({ id: "docs", isCurrent: true, caption: "currentLocation", disabled: false });
  });

  it("disables the moved entry and everything inside it", () => {
    const nodes = toFolderPickerNodes(
      [PERSONAL],
      {
        p: loaded([folder("moved", "Photos")]),
        moved: { ...loaded([folder("inner", "Summer")]), driveId: "p", folderId: "moved" },
      },
      SOURCE,
    );
    const moved = nodes[0]?.children?.[0];
    const inner = moved?.children?.[0];

    expect(moved).toMatchObject({ id: "moved", disabled: true });
    expect(inner).toMatchObject({ id: "inner", disabled: true });
  });

  it("leaves children undefined until a folder has loaded", () => {
    const nodes = toFolderPickerNodes([PERSONAL], {}, SOURCE);

    expect(nodes[0]?.children).toBeUndefined();
    expect(nodes[0]?.hasChildren).toBe(true);
  });
});
