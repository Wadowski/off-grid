// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRefreshOnUploadDone } from "./use-refresh-on-upload-done.js";
import type { Drive, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const OTHER_DRIVE_ID = "1f2e3d4c-5b6a-4978-8695-a4b3c2d1e0f9" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];

const queueState = {
  current: {
    lastDone: null as {
      itemId: string;
      driveId: Drive["id"];
      folderId: FileEntry["id"] | null;
    } | null,
  },
};

vi.mock("../uploads/index.js", () => ({
  useUploadQueueContext: () => ({ lastDone: queueState.current.lastDone }),
}));

const wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

describe("useRefreshOnUploadDone", () => {
  it("refreshes the open folder when an upload finishes in it", () => {
    const refreshQuietly = vi.fn(async () => undefined);
    const { rerender } = renderHook(
      ({ folder }) => useRefreshOnUploadDone(DRIVE_ID, folder, refreshQuietly),
      { wrapper, initialProps: { folder: FOLDER_ID as FileEntry["id"] | null } },
    );

    queueState.current.lastDone = { itemId: "a", driveId: DRIVE_ID, folderId: FOLDER_ID };
    rerender({ folder: FOLDER_ID });

    expect(refreshQuietly).toHaveBeenCalledTimes(1);
  });

  it("does not refresh a folder the person has left", () => {
    const refreshQuietly = vi.fn(async () => undefined);
    const { rerender } = renderHook(() => useRefreshOnUploadDone(DRIVE_ID, null, refreshQuietly), {
      wrapper,
    });

    queueState.current.lastDone = { itemId: "b", driveId: DRIVE_ID, folderId: FOLDER_ID };
    rerender();

    expect(refreshQuietly).not.toHaveBeenCalled();
  });

  it("does not refresh for an upload into another drive", () => {
    const refreshQuietly = vi.fn(async () => undefined);
    const { rerender } = renderHook(() => useRefreshOnUploadDone(DRIVE_ID, null, refreshQuietly), {
      wrapper,
    });

    queueState.current.lastDone = { itemId: "c", driveId: OTHER_DRIVE_ID, folderId: null };
    rerender();

    expect(refreshQuietly).not.toHaveBeenCalled();
  });
});
