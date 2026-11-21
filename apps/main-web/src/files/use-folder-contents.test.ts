// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import type { Drive, FileEntry, FolderTarget } from "./types.js";
import { useFolderContents } from "./use-folder-contents.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const OTHER_DRIVE_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f" as Drive["id"];
const DRIVE_TARGET: FolderTarget = { kind: "drive", driveId: DRIVE_ID };
const FOLDER_TARGET: FolderTarget = { kind: "folder", folderId: FOLDER_ID };
const OTHER_DRIVE_TARGET: FolderTarget = { kind: "drive", driveId: OTHER_DRIVE_ID };
const PHOTOS = {
  id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: true,
};
const TRIP = {
  id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
  driveId: DRIVE_ID,
  parentId: null,
  name: "Trip.pdf",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
};
const BREADCRUMBS = [{ kind: "drive", id: DRIVE_ID, name: "Personal" }];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFolderContents", () => {
  it("loads the items and breadcrumbs of a drive root", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          status: 200,
          body: { items: [PHOTOS], breadcrumbs: BREADCRUMBS, nextCursor: null },
        }),
      ),
    );

    const { result } = renderHook(() => useFolderContents(DRIVE_TARGET, true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.items).toEqual([PHOTOS]);
    expect(result.current.breadcrumbs).toEqual(BREADCRUMBS);
    expect(result.current.hasMore).toBe(false);
  });

  it("requests the children of a folder target", async () => {
    const requestedUrls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        requestedUrls.push(String(input));
        return jsonResponse({
          status: 200,
          body: { items: [], breadcrumbs: [], nextCursor: null },
        });
      }),
    );

    renderHook(() => useFolderContents(FOLDER_TARGET, true));

    await waitFor(() => expect(requestedUrls).toHaveLength(1));
    expect(requestedUrls[0]).toContain(FOLDER_ID);
  });

  it("appends the next page on loadMore and stops when there is no cursor", async () => {
    const responses = [
      jsonResponse({
        status: 200,
        body: { items: [PHOTOS], breadcrumbs: BREADCRUMBS, nextCursor: "page-2" },
      }),
      jsonResponse({ status: 200, body: { items: [TRIP], breadcrumbs: [], nextCursor: null } }),
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => responses.shift() ?? jsonResponse({ status: 200, body: {} })),
    );

    const { result } = renderHook(() => useFolderContents(DRIVE_TARGET, true));
    await waitFor(() => expect(result.current.items).toEqual([PHOTOS]));
    expect(result.current.hasMore).toBe(true);

    await act(() => result.current.loadMore());

    expect(result.current.items).toEqual([PHOTOS, TRIP]);
    expect(result.current.hasMore).toBe(false);
  });

  it("ignores a response that arrives after the target changed", async () => {
    let resolveFirst: (response: Response) => void = () => undefined;
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(async () =>
        jsonResponse({ status: 200, body: { items: [TRIP], breadcrumbs: [], nextCursor: null } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ target }: { target: FolderTarget }) => useFolderContents(target, true),
      { initialProps: { target: DRIVE_TARGET } },
    );
    rerender({ target: OTHER_DRIVE_TARGET });
    await waitFor(() => expect(result.current.items).toEqual([TRIP]));

    await act(async () => {
      resolveFirst(
        jsonResponse({ status: 200, body: { items: [PHOTOS], breadcrumbs: [], nextCursor: null } }),
      );
    });

    expect(result.current.items).toEqual([TRIP]);
  });

  it("reports not found when the folder is gone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 404, body: { code: "NOT_FOUND", message: "x" } })),
    );

    const { result } = renderHook(() => useFolderContents(FOLDER_TARGET, true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.notFound");
    expect(result.current.items).toEqual([]);
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 200, body: {} }));
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useFolderContents(DRIVE_TARGET, false));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
