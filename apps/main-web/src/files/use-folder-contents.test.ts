// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useFolderContents } from "./use-folder-contents.js";
import type { Drive, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const BREADCRUMBS = [{ kind: "drive", id: DRIVE_ID, name: "Personal" }];
const UPDATED_AT = "2026-01-01T00:00:00.000Z";
const FOLDER_ITEM = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  deletedAt: null,
  isFolder: true,
  itemCount: 2,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

const pageOf = (items: readonly unknown[], nextCursor: string | null) =>
  jsonResponse({ status: 200, body: { items, breadcrumbs: BREADCRUMBS, nextCursor } });

describe("useFolderContents", () => {
  it("loads the first page of the drive root", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => pageOf([FOLDER_ITEM], null));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFolderContents(DRIVE_ID, null, true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.items).toEqual([FOLDER_ITEM]);
    expect(result.current.breadcrumbs).toEqual(BREADCRUMBS);
    expect(result.current.hasMore).toBe(false);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`/drives/${DRIVE_ID}/children`);
  });

  it("loads the children of a folder", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => pageOf([], null));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFolderContents(DRIVE_ID, FOLDER_ID, true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`/files/${FOLDER_ID}/children`);
  });

  it("appends the next page when asked to load more", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(pageOf([FOLDER_ITEM], "cursor-2"))
      .mockResolvedValueOnce(
        pageOf([{ ...FOLDER_ITEM, id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" }], null),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFolderContents(DRIVE_ID, null, true));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    await act(() => result.current.loadMore());

    expect(result.current.items).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("cursor=cursor-2");
  });

  it("reports the error text when the contents cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 404, body: { code: "NOT_FOUND", message: "x" } })),
    );

    const { result } = renderHook(() => useFolderContents(DRIVE_ID, FOLDER_ID, true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.notFound");
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn<typeof fetch>(async () => pageOf([], null));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFolderContents(DRIVE_ID, FOLDER_ID, false));

    expect(result.current.status).toBe("loading");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
