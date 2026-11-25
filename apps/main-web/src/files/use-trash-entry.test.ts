// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { webFilesClient } from "../api/web-api-client.js";
import { useTrashEntry } from "./use-trash-entry.js";
import type { FileEntry } from "./types.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTrashEntry", () => {
  it("moves the entry to the trash and reports success", async () => {
    const trash = vi.spyOn(webFilesClient, "trashFile").mockResolvedValue({} as FileEntry);
    const { result } = renderHook(() => useTrashEntry());

    let moved = false;
    await act(async () => {
      moved = await result.current.trash(FILE_ID);
    });

    expect(trash).toHaveBeenCalledWith(FILE_ID);
    expect(moved).toBe(true);
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("keeps the mapped error and reports failure when the trash call fails", async () => {
    vi.spyOn(webFilesClient, "trashFile").mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "missing"),
    );
    const { result } = renderHook(() => useTrashEntry());

    let moved = true;
    await act(async () => {
      moved = await result.current.trash(FILE_ID);
    });

    expect(moved).toBe(false);
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.notFound");
  });

  it("is pending while the call runs and ignores a second request while it is in flight", async () => {
    let finish: (value: FileEntry) => void = () => undefined;
    const trash = vi
      .spyOn(webFilesClient, "trashFile")
      .mockReturnValue(new Promise<FileEntry>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useTrashEntry());

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.trash(FILE_ID);
    });
    expect(result.current.status).toBe("pending");

    let second = true;
    await act(async () => {
      second = await result.current.trash(FILE_ID);
    });
    expect(second).toBe(false);
    expect(trash).toHaveBeenCalledOnce();

    await act(async () => {
      finish({} as FileEntry);
      await first;
    });
    expect(result.current.status).toBe("idle");
  });
});
