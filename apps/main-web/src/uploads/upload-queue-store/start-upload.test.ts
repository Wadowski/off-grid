// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile, uploadFileVersion } from "../../files/files-api.js";
import type { Drive, FileEntry } from "../../files/types.js";
import type { RunningUploadRef, UploadDispatch, UploadItem } from "../types.js";
import { createUploadItem } from "./create-upload-item.js";
import { startUpload } from "./start-upload.js";

vi.mock("../../files/files-api.js", () => ({ uploadFile: vi.fn(), uploadFileVersion: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileEntry["id"];

const target = { driveId: DRIVE_ID, folderId: FOLDER_ID };
const newFileItem = (file: File): UploadItem =>
  createUploadItem("new-item", file, target, null, null);
const versionItem = (file: File): UploadItem =>
  createUploadItem("version-item", file, target, null, FILE_ID);

const dispatchSpy = (): UploadDispatch => vi.fn() as unknown as UploadDispatch;
const runningRef = (): RunningUploadRef => ({ current: null });

beforeEach(() => {
  vi.mocked(uploadFile).mockResolvedValue({} as FileEntry);
  vi.mocked(uploadFileVersion).mockResolvedValue({} as FileEntry);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("startUpload", () => {
  it("creates a new file in the target folder when the item has no file id", async () => {
    const file = new File(["hello"], "Trip.pdf");
    const dispatch = dispatchSpy();

    startUpload(newFileItem(file), file, dispatch, runningRef());
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: "finished", id: "new-item" }),
    );

    expect(uploadFile).toHaveBeenCalledWith(
      DRIVE_ID,
      expect.objectContaining({ file, parentId: FOLDER_ID }),
    );
    expect(uploadFileVersion).not.toHaveBeenCalled();
  });

  it("uploads the file as a new version when the item names an existing file", async () => {
    const file = new File(["hello"], "Trip.pdf");
    const dispatch = dispatchSpy();

    startUpload(versionItem(file), file, dispatch, runningRef());
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: "finished", id: "version-item" }),
    );

    expect(uploadFileVersion).toHaveBeenCalledWith(FILE_ID, expect.objectContaining({ file }));
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("reports the mapped error when a version upload fails", async () => {
    const file = new File(["hello"], "Trip.pdf");
    vi.mocked(uploadFileVersion).mockRejectedValue(new TypeError("Failed to fetch"));
    const dispatch = dispatchSpy();

    startUpload(versionItem(file), file, dispatch, runningRef());
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({
        type: "failed",
        id: "version-item",
        errorTextId: "files.errors.failed",
      }),
    );
  });

  it("forgets the running upload once it has finished", async () => {
    const file = new File(["hello"], "Trip.pdf");
    const running = runningRef();
    const dispatch = dispatchSpy();

    startUpload(versionItem(file), file, dispatch, running);
    await vi.waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: "finished", id: "version-item" }),
    );

    expect(running.current).toBeNull();
  });
});
