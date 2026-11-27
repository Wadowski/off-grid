// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { ApiError } from "@offgrid/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import { useEmptyTrash } from "./use-empty-trash.js";
import type { Drive } from "./types.js";

const DRIVE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as Drive["id"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useEmptyTrash", () => {
  it("empties the trash and reports success", async () => {
    const empty = vi.spyOn(webFilesClient, "emptyDriveTrash").mockResolvedValue(undefined);
    const { result } = renderHook(() => useEmptyTrash());

    let emptied = false;
    await act(async () => {
      emptied = await result.current.empty(DRIVE_ID);
    });

    expect(empty).toHaveBeenCalledWith(DRIVE_ID);
    expect(emptied).toBe(true);
    expect(result.current.status).toBe("idle");
    expect(result.current.errorTextId).toBeNull();
  });

  it("keeps the mapped error and reports failure when emptying fails", async () => {
    vi.spyOn(webFilesClient, "emptyDriveTrash").mockRejectedValue(
      new ApiError(409, "NOT_TRASHED", "not in the trash"),
    );
    const { result } = renderHook(() => useEmptyTrash());

    let emptied = true;
    await act(async () => {
      emptied = await result.current.empty(DRIVE_ID);
    });

    expect(emptied).toBe(false);
    expect(result.current.status).toBe("failed");
    expect(result.current.errorTextId).toBe("files.errors.notTrashed");
  });

  it("ignores a second empty while the first is in flight", async () => {
    let finish: () => void = () => undefined;
    const empty = vi
      .spyOn(webFilesClient, "emptyDriveTrash")
      .mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useEmptyTrash());

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.empty(DRIVE_ID);
    });
    expect(result.current.status).toBe("pending");

    let second = true;
    await act(async () => {
      second = await result.current.empty(DRIVE_ID);
    });
    expect(second).toBe(false);
    expect(empty).toHaveBeenCalledOnce();

    await act(async () => {
      finish();
      await first;
    });
    expect(result.current.status).toBe("idle");
  });
});
