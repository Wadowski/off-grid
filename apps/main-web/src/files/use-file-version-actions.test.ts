// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { downloadFileVersion } from "./download-file-version.js";
import { deleteFileVersion, restoreFileVersion } from "./files-api.js";
import { useFileVersionActions } from "./use-file-version-actions.js";
import type { FileEntry, FileVersion } from "./types.js";

vi.mock("./files-api.js", () => ({
  restoreFileVersion: vi.fn(),
  deleteFileVersion: vi.fn(),
}));
vi.mock("./download-file-version.js", () => ({ downloadFileVersion: vi.fn() }));

const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const VERSION: FileVersion = {
  id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d" as FileVersion["id"],
  fileId: FILE_ID as FileVersion["fileId"],
  number: 1,
  size: 12,
  mimeType: "text/plain",
  createdByUserId: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileVersion["createdByUserId"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("useFileVersionActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores a version, reports it and asks the caller to refresh", async () => {
    vi.mocked(restoreFileVersion).mockResolvedValue({} as never);
    const onChanged = vi.fn();
    const { result } = renderHook(() => useFileVersionActions(FILE_ID, onChanged));

    await act(() => result.current.restore(VERSION));

    expect(restoreFileVersion).toHaveBeenCalledWith(FILE_ID, VERSION.id);
    expect(result.current.completed).toEqual({ kind: "restored", versionNumber: 1 });
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(result.current.pendingVersionId).toBeNull();
  });

  it("deletes a version and asks the caller to refresh", async () => {
    vi.mocked(deleteFileVersion).mockResolvedValue(undefined);
    const onChanged = vi.fn();
    const { result } = renderHook(() => useFileVersionActions(FILE_ID, onChanged));

    await act(() => result.current.remove(VERSION));

    expect(deleteFileVersion).toHaveBeenCalledWith(FILE_ID, VERSION.id);
    expect(result.current.completed).toEqual({ kind: "deleted", versionNumber: 1 });
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("downloads a version without asking the caller to refresh", async () => {
    vi.mocked(downloadFileVersion).mockResolvedValue(undefined);
    const onChanged = vi.fn();
    const { result } = renderHook(() => useFileVersionActions(FILE_ID, onChanged));

    await act(() => result.current.download(VERSION, "Notes.txt"));

    expect(downloadFileVersion).toHaveBeenCalledWith(FILE_ID, VERSION.id, "Notes.txt");
    expect(result.current.completed).toEqual({ kind: "downloaded", versionNumber: 1 });
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("maps the current-version error to its message and does not refresh", async () => {
    vi.mocked(deleteFileVersion).mockRejectedValue(
      new ApiError(409, "CURRENT_VERSION", "Current version"),
    );
    const onChanged = vi.fn();
    const { result } = renderHook(() => useFileVersionActions(FILE_ID, onChanged));

    await act(() => result.current.remove(VERSION));

    expect(result.current.errorTextId).toBe("files.errors.currentVersion");
    expect(result.current.completed).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("marks the version pending while the action runs", async () => {
    let finish: () => void = () => undefined;
    vi.mocked(restoreFileVersion).mockReturnValue(
      new Promise((resolve) => {
        finish = () => resolve({} as never);
      }),
    );
    const { result } = renderHook(() => useFileVersionActions(FILE_ID, vi.fn()));

    act(() => {
      void result.current.restore(VERSION);
    });
    await waitFor(() => expect(result.current.pendingVersionId).toBe(VERSION.id));
    await act(async () => {
      finish();
    });
    expect(result.current.pendingVersionId).toBeNull();
  });
});
