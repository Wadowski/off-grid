// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFolderPage } from "./fetch-folder-page.js";
import type { Drive, FileListItem, FileListPage, FolderTreeNodeRef } from "./types.js";
import { useFolderTree } from "./use-folder-tree.js";

vi.mock("./fetch-folder-page.js", () => ({ fetchFolderPage: vi.fn() }));

const ROOT: FolderTreeNodeRef = { id: "d1", driveId: "d1" as Drive["id"], folderId: null };
const FOLDER_ITEM = { id: "f1", name: "Docs", isFolder: true } as FileListItem;
const FILE_ITEM = { id: "x1", name: "Notes.txt", isFolder: false } as FileListItem;
const page = (items: FileListItem[], nextCursor: string | null = null): FileListPage =>
  ({ items, breadcrumbs: [], nextCursor }) as FileListPage;

afterEach(() => {
  vi.resetAllMocks();
});

describe("useFolderTree", () => {
  it("loads a folder on first expand and keeps only folders", async () => {
    vi.mocked(fetchFolderPage).mockResolvedValue(page([FOLDER_ITEM, FILE_ITEM]));
    const { result } = renderHook(() => useFolderTree());

    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {});

    expect(fetchFolderPage).toHaveBeenCalledTimes(1);
    expect(result.current.nodes["d1"]?.folders).toEqual([FOLDER_ITEM]);
    expect(result.current.nodes["d1"]?.status).toBe("ready");
    expect(result.current.expandedIds.has("d1")).toBe(true);
  });

  it("does not fetch again when collapsed and expanded once more", async () => {
    vi.mocked(fetchFolderPage).mockResolvedValue(page([FOLDER_ITEM]));
    const { result } = renderHook(() => useFolderTree());

    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {});
    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {
      result.current.toggle(ROOT);
    });

    expect(fetchFolderPage).toHaveBeenCalledTimes(1);
  });

  it("records a load error and retries it on the next expand", async () => {
    vi.mocked(fetchFolderPage).mockRejectedValueOnce(new ApiError(500, "VALIDATION_FAILED", "x"));
    vi.mocked(fetchFolderPage).mockResolvedValueOnce(page([FOLDER_ITEM]));
    const { result } = renderHook(() => useFolderTree());

    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {});
    expect(result.current.nodes["d1"]?.status).toBe("failed");
    expect(result.current.nodes["d1"]?.errorTextId).toBe("files.errors.validationFailed");

    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {});

    expect(fetchFolderPage).toHaveBeenCalledTimes(2);
    expect(result.current.nodes["d1"]?.status).toBe("ready");
  });

  it("appends the next page when Load more is used", async () => {
    vi.mocked(fetchFolderPage)
      .mockResolvedValueOnce(page([FOLDER_ITEM], "cursor-1"))
      .mockResolvedValueOnce(page([{ ...FOLDER_ITEM, id: "f2", name: "Photos" } as FileListItem]));
    const { result } = renderHook(() => useFolderTree());

    await act(async () => {
      result.current.toggle(ROOT);
    });
    await act(async () => {});
    await act(async () => {
      result.current.loadMore(ROOT);
    });
    await act(async () => {});

    expect(fetchFolderPage).toHaveBeenLastCalledWith("d1", null, "cursor-1", expect.any(Object));
    expect(result.current.nodes["d1"]?.folders.map((folder) => folder.id)).toEqual(["f1", "f2"]);
    expect(result.current.nodes["d1"]?.nextCursor).toBeNull();
  });
});
