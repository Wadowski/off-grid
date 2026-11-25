// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFolder } from "./create-folder.js";
import type { Drive, FileEntry } from "./types.js";
import { useCreateFolder } from "./use-create-folder.js";

vi.mock("./create-folder.js", () => ({ createFolder: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const ENTRY = { id: FOLDER_ID, name: "Holiday" } as FileEntry;

afterEach(() => {
  vi.resetAllMocks();
});

describe("useCreateFolder", () => {
  it("returns the created entry and ends idle", async () => {
    vi.mocked(createFolder).mockResolvedValue(ENTRY);
    const { result } = renderHook(() => useCreateFolder(DRIVE_ID, null));

    let created: FileEntry | null = null;
    await act(async () => {
      created = await result.current.create("Holiday");
    });

    expect(created).toEqual(ENTRY);
    expect(createFolder).toHaveBeenCalledWith(DRIVE_ID, null, "Holiday");
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("maps a taken name to its message and fails", async () => {
    vi.mocked(createFolder).mockRejectedValue(new ApiError(409, "NAME_TAKEN", "taken"));
    const { result } = renderHook(() => useCreateFolder(DRIVE_ID, FOLDER_ID));

    let created: FileEntry | null = ENTRY;
    await act(async () => {
      created = await result.current.create("Holiday");
    });

    expect(created).toBeNull();
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.nameTaken");
    expect(createFolder).toHaveBeenCalledWith(DRIVE_ID, FOLDER_ID, "Holiday");
  });

  it("maps an unknown error to the generic failure message", async () => {
    vi.mocked(createFolder).mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useCreateFolder(DRIVE_ID, null));

    await act(async () => {
      await result.current.create("Holiday");
    });

    expect(result.current.errorTextId).toBe("files.errors.failed");
  });

  it("does not send a request when no drive is open", async () => {
    const { result } = renderHook(() => useCreateFolder(null, null));

    await act(async () => {
      await result.current.create("Holiday");
    });

    expect(createFolder).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });
});
