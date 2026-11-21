// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import type { FileEntry } from "./types.js";
import { useFileDetails } from "./use-file-details.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const OTHER_FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileEntry["id"];
const FILE = {
  id: FILE_ID,
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

describe("useFileDetails", () => {
  it("loads the file and its breadcrumbs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ status: 200, body: { file: FILE, breadcrumbs: BREADCRUMBS } }),
      ),
    );

    const { result } = renderHook(() => useFileDetails(FILE_ID, true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.file).toEqual(FILE);
    expect(result.current.breadcrumbs).toEqual(BREADCRUMBS);
  });

  it("reports not found when the file is gone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 404, body: { code: "NOT_FOUND", message: "x" } })),
    );

    const { result } = renderHook(() => useFileDetails(FILE_ID, true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.notFound");
    expect(result.current.file).toBeNull();
  });

  it("reloads when the file id changes", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      jsonResponse({
        status: 200,
        body: {
          file: { ...FILE, id: String(input).includes(OTHER_FILE_ID) ? OTHER_FILE_ID : FILE_ID },
          breadcrumbs: BREADCRUMBS,
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ fileId }: { fileId: FileEntry["id"] }) => useFileDetails(fileId, true),
      { initialProps: { fileId: FILE_ID } },
    );
    await waitFor(() => expect(result.current.file?.id).toBe(FILE_ID));

    rerender({ fileId: OTHER_FILE_ID });

    await waitFor(() => expect(result.current.file?.id).toBe(OTHER_FILE_ID));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 200, body: {} }));
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useFileDetails(FILE_ID, false));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
