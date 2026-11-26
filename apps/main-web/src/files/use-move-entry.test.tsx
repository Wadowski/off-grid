// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { moveEntry } from "./move-entry.js";
import type { Drive, FileEntry } from "./types.js";
import { useMoveEntry } from "./use-move-entry.js";

vi.mock("./move-entry.js", () => ({ moveEntry: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const RESULT = { file: { id: FILE_ID } as FileEntry, crossOwnerNotice: false };
const TARGET = { driveId: DRIVE_ID, parentId: null };

afterEach(() => {
  vi.resetAllMocks();
});

describe("useMoveEntry", () => {
  it("returns the moved result and ends idle", async () => {
    vi.mocked(moveEntry).mockResolvedValue(RESULT);
    const { result } = renderHook(() => useMoveEntry());

    let moved: unknown = null;
    await act(async () => {
      moved = await result.current.move(FILE_ID, TARGET);
    });

    expect(moved).toEqual(RESULT);
    expect(moveEntry).toHaveBeenCalledWith(FILE_ID, TARGET);
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("maps a refused move to its message and fails", async () => {
    vi.mocked(moveEntry).mockRejectedValue(new ApiError(400, "INVALID_MOVE", "invalid"));
    const { result } = renderHook(() => useMoveEntry());

    let moved: unknown = RESULT;
    await act(async () => {
      moved = await result.current.move(FILE_ID, TARGET);
    });

    expect(moved).toBeNull();
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.invalidMove");
  });

  it("ignores a second submit while the first move is in flight", async () => {
    let finish: (value: typeof RESULT) => void = () => undefined;
    vi.mocked(moveEntry).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useMoveEntry());

    let first: Promise<unknown> = Promise.resolve();
    act(() => {
      first = result.current.move(FILE_ID, TARGET);
    });
    let second: unknown = "unset";
    await act(async () => {
      second = await result.current.move(FILE_ID, TARGET);
    });
    await act(async () => {
      finish(RESULT);
      await first;
    });

    expect(second).toBeNull();
    expect(moveEntry).toHaveBeenCalledTimes(1);
  });
});
