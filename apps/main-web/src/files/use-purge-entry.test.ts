// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { ApiError } from "@offgrid/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import { usePurgeEntry } from "./use-purge-entry.js";
import type { FileEntry } from "./types.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePurgeEntry", () => {
  it("deletes the entry for good and reports success", async () => {
    const purge = vi.spyOn(webFilesClient, "purgeFile").mockResolvedValue(undefined);
    const { result } = renderHook(() => usePurgeEntry());

    let purged = false;
    await act(async () => {
      purged = await result.current.purge(FILE_ID);
    });

    expect(purge).toHaveBeenCalledWith(FILE_ID);
    expect(purged).toBe(true);
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("keeps the mapped error and reports failure when the purge fails", async () => {
    vi.spyOn(webFilesClient, "purgeFile").mockRejectedValue(
      new ApiError(409, "NOT_TRASHED", "not in the trash"),
    );
    const { result } = renderHook(() => usePurgeEntry());

    let purged = true;
    await act(async () => {
      purged = await result.current.purge(FILE_ID);
    });

    expect(purged).toBe(false);
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.notTrashed");
  });

  it("ignores a second purge while the first is in flight", async () => {
    let finish: () => void = () => undefined;
    const purge = vi
      .spyOn(webFilesClient, "purgeFile")
      .mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => usePurgeEntry());

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.purge(FILE_ID);
    });
    expect(result.current.status).toBe("pending");

    let second = true;
    await act(async () => {
      second = await result.current.purge(FILE_ID);
    });
    expect(second).toBe(false);
    expect(purge).toHaveBeenCalledOnce();

    await act(async () => {
      finish();
      await first;
    });
    expect(result.current.status).toBe("idle");
  });
});
