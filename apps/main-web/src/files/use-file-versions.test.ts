// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import type { FileEntry } from "./types.js";
import { useFileVersions } from "./use-file-versions.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const VERSION = {
  id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
  fileId: FILE_ID,
  number: 1,
  size: 2048,
  mimeType: "application/pdf",
  createdByUserId: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  createdAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFileVersions", () => {
  it("loads the versions of the file", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 200, body: { versions: [VERSION] } })),
    );

    const { result } = renderHook(() => useFileVersions(FILE_ID, true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.versions).toEqual([VERSION]);
  });

  it("reports the mapped error when the versions cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    const { result } = renderHook(() => useFileVersions(FILE_ID, true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.failed");
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useFileVersions(FILE_ID, false));

    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("refreshes quietly without showing the loading state", async () => {
    const updated = { ...VERSION, id: "9b0c1d2e-3f4a-4b5c-9d7e-8f9a0b1c2d3e", number: 2 };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: 200, body: { versions: [VERSION] } }))
      .mockResolvedValueOnce(jsonResponse({ status: 200, body: { versions: [updated, VERSION] } }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFileVersions(FILE_ID, true));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.refreshQuietly();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.versions).toEqual([updated, VERSION]);
  });

  it("keeps the loaded versions when a quiet refresh fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: 200, body: { versions: [VERSION] } }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFileVersions(FILE_ID, true));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.refreshQuietly();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.errorTextId).toBeNull();
    expect(result.current.versions).toEqual([VERSION]);
  });
});
