// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import { useDriveTrash } from "./use-drive-trash.js";
import type { Drive, FileListItem, FileListPage } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const TOP = { id: "top", parentId: null, name: "Old receipt.pdf" } as FileListItem;
const CHILD = { id: "child", parentId: "top-folder", name: "sunset.jpg" } as FileListItem;
const FOLDER = { id: "top-folder", parentId: null, name: "Holiday" } as FileListItem;

const pageOf = (items: FileListItem[], nextCursor: string | null): FileListPage =>
  ({ items, breadcrumbs: [], nextCursor }) as FileListPage;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDriveTrash", () => {
  it("is loading until every page of the trash is read, then shows the roots", async () => {
    vi.spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValueOnce(pageOf([TOP, CHILD], "next"))
      .mockResolvedValueOnce(pageOf([FOLDER], null));
    const { result } = renderHook(() => useDriveTrash(DRIVE_ID, true));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.items.map((item) => item.id)).toEqual(["top", "top-folder"]);
  });

  it("does not load when it is not enabled", () => {
    const list = vi.spyOn(webFilesClient, "listDriveTrash");
    renderHook(() => useDriveTrash(DRIVE_ID, false));

    expect(list).not.toHaveBeenCalled();
  });

  it("reports a failure when a later page cannot be read", async () => {
    vi.spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValueOnce(pageOf([TOP], "next"))
      .mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useDriveTrash(DRIVE_ID, true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.failed");
    expect(result.current.items).toEqual([]);
  });

  it("removes one entry from the list without reading the trash again", async () => {
    const list = vi
      .spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValue(pageOf([TOP, FOLDER], null));
    const { result } = renderHook(() => useDriveTrash(DRIVE_ID, true));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.removeItem(TOP.id));

    expect(result.current.items.map((item) => item.id)).toEqual(["top-folder"]);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("re-reads the trash quietly and keeps the list when that read fails", async () => {
    const list = vi
      .spyOn(webFilesClient, "listDriveTrash")
      .mockResolvedValueOnce(pageOf([TOP], null))
      .mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useDriveTrash(DRIVE_ID, true));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.refreshQuietly();
    });

    expect(list).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("ready");
    expect(result.current.items.map((item) => item.id)).toEqual(["top"]);
  });
});
