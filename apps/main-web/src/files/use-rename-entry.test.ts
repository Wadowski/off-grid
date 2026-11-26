// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { webFilesClient } from "../api/web-api-client.js";
import { useRenameEntry } from "./use-rename-entry.js";
import type { FileEntry } from "./types.js";

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const ENTRY = { id: FILE_ID, name: "Notes.md" } as FileEntry;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRenameEntry", () => {
  it("renames the entry and returns it on success", async () => {
    const rename = vi.spyOn(webFilesClient, "renameFile").mockResolvedValue(ENTRY);
    const { result } = renderHook(() => useRenameEntry());

    let renamed: FileEntry | null = null;
    await act(async () => {
      renamed = await result.current.rename(FILE_ID, "Notes.md");
    });

    expect(rename).toHaveBeenCalledWith(FILE_ID, { name: "Notes.md" });
    expect(renamed).toEqual(ENTRY);
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("keeps the mapped name-taken error when the name is already used", async () => {
    vi.spyOn(webFilesClient, "renameFile").mockRejectedValue(
      new ApiError(409, "NAME_TAKEN", "taken"),
    );
    const { result } = renderHook(() => useRenameEntry());

    let renamed: FileEntry | null = ENTRY;
    await act(async () => {
      renamed = await result.current.rename(FILE_ID, "Zulu.txt");
    });

    expect(renamed).toBeNull();
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.nameTaken");
  });

  it("maps a missing entry to the not-found error", async () => {
    vi.spyOn(webFilesClient, "renameFile").mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "missing"),
    );
    const { result } = renderHook(() => useRenameEntry());

    await act(async () => {
      await result.current.rename(FILE_ID, "Notes.md");
    });

    expect(result.current.errorTextId).toBe("files.errors.notFound");
  });

  it("falls back to the generic error for an unknown failure", async () => {
    vi.spyOn(webFilesClient, "renameFile").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useRenameEntry());

    await act(async () => {
      await result.current.rename(FILE_ID, "Notes.md");
    });

    expect(result.current.errorTextId).toBe("files.errors.failed");
  });

  it("ignores a second submit while the first is in flight", async () => {
    let finish: (value: FileEntry) => void = () => undefined;
    const rename = vi
      .spyOn(webFilesClient, "renameFile")
      .mockReturnValue(new Promise<FileEntry>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useRenameEntry());

    let first: Promise<FileEntry | null> = Promise.resolve(null);
    act(() => {
      first = result.current.rename(FILE_ID, "Notes.md");
    });
    expect(result.current.status).toBe("submitting");

    let second: FileEntry | null = ENTRY;
    await act(async () => {
      second = await result.current.rename(FILE_ID, "Notes.md");
    });
    expect(second).toBeNull();
    expect(rename).toHaveBeenCalledOnce();

    await act(async () => {
      finish(ENTRY);
      await first;
    });
    expect(result.current.status).toBe("idle");
  });
});
