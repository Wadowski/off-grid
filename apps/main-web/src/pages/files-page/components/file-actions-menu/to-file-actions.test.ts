// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { FileListItem } from "../../../../files/types.js";
import { toFileActions } from "./to-file-actions.js";

const FOLDER = { id: "f-1", name: "Photos", isFolder: true } as FileListItem;
const FILE = { id: "f-2", name: "Notes.pdf", isFolder: false } as FileListItem;

const handlers = () => ({ onOpen: vi.fn(), onMove: vi.fn(), onDelete: vi.fn() });

describe("toFileActions", () => {
  it("offers Open, Move and then Delete, with Delete last and marked as danger", () => {
    const actions = toFileActions(FILE, handlers());

    expect(actions.map((action) => action.id)).toEqual(["open", "move", "delete"]);
    expect(actions.at(-1)).toMatchObject({ id: "delete", tone: "danger" });
  });

  it("uses a folder icon for folders and a file icon for files", () => {
    expect(toFileActions(FOLDER, handlers())[0]?.icon).toBe("folder_open");
    expect(toFileActions(FILE, handlers())[0]?.icon).toBe("open_in_new");
  });

  it("calls the open, move and delete handlers when their item is chosen", () => {
    const actionHandlers = handlers();
    const [open, move, remove] = toFileActions(FILE, actionHandlers);

    open?.onSelect();
    move?.onSelect();
    remove?.onSelect();

    expect(actionHandlers.onOpen).toHaveBeenCalledOnce();
    expect(actionHandlers.onMove).toHaveBeenCalledOnce();
    expect(actionHandlers.onDelete).toHaveBeenCalledOnce();
  });
});
