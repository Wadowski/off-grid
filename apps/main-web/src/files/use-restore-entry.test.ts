// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { ApiError } from "@offgrid/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import { useRestoreEntry } from "./use-restore-entry.js";
import type { FileEntry } from "./types.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const RESTORED = { id: FILE_ID, name: "Report (2).pdf" } as FileEntry;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRestoreEntry", () => {
  it("restores the entry and returns it", async () => {
    const restore = vi.spyOn(webFilesClient, "restoreFile").mockResolvedValue(RESTORED);
    const { result } = renderHook(() => useRestoreEntry());

    let restored: FileEntry | null = null;
    await act(async () => {
      restored = await result.current.restore(FILE_ID);
    });

    expect(restore).toHaveBeenCalledWith(FILE_ID);
    expect(restored).toBe(RESTORED);
    expect(result.current.status).toBe("idle");
  });

  it("keeps the mapped error and returns nothing when the restore fails", async () => {
    vi.spyOn(webFilesClient, "restoreFile").mockRejectedValue(
      new ApiError(409, "NOT_TRASHED", "not in the trash"),
    );
    const { result } = renderHook(() => useRestoreEntry());

    let restored: FileEntry | null = RESTORED;
    await act(async () => {
      restored = await result.current.restore(FILE_ID);
    });

    expect(restored).toBeNull();
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.notTrashed");
  });

  it("ignores a second restore while the first is in flight", async () => {
    let finish: (value: FileEntry) => void = () => undefined;
    const restore = vi
      .spyOn(webFilesClient, "restoreFile")
      .mockReturnValue(new Promise<FileEntry>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useRestoreEntry());

    let first: Promise<FileEntry | null> = Promise.resolve(null);
    act(() => {
      first = result.current.restore(FILE_ID);
    });
    expect(result.current.status).toBe("pending");

    let second: FileEntry | null = RESTORED;
    await act(async () => {
      second = await result.current.restore(FILE_ID);
    });
    expect(second).toBeNull();
    expect(restore).toHaveBeenCalledOnce();

    await act(async () => {
      finish(RESTORED);
      await first;
    });
    expect(result.current.status).toBe("idle");
  });
});
