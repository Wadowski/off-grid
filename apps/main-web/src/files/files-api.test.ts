// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import {
  deleteFileVersion,
  createFolder,
  getFile,
  getFileContent,
  getFileVersionContent,
  listDriveChildren,
  listDrives,
  listFileChildren,
  listFileVersions,
  restoreFileVersion,
  trashFile,
  uploadFile,
  uploadFileVersion,
} from "./files-api.js";
import type { Drive, FileDetails, FileEntry, FileListPage, FileVersion } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const DRIVE: Drive = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;
const PAGE: FileListPage = { items: [], breadcrumbs: [], nextCursor: null } as FileListPage;
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d" as FileVersion["id"];
const DETAILS: FileDetails = { file: {} as FileEntry, breadcrumbs: [] } as FileDetails;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("files API", () => {
  it("creates a folder through the files client", async () => {
    const create = vi
      .spyOn(webFilesClient, "createFolder")
      .mockResolvedValue({ id: FOLDER_ID } as FileEntry);

    await expect(createFolder(DRIVE_ID, { parentId: null, name: "Holiday" })).resolves.toEqual({
      id: FOLDER_ID,
    });
    expect(create).toHaveBeenCalledWith(DRIVE_ID, { parentId: null, name: "Holiday" });
  });

  it("returns the drives the files client lists", async () => {
    const list = vi.spyOn(webFilesClient, "listDrives").mockResolvedValue([DRIVE]);

    await expect(listDrives()).resolves.toEqual([DRIVE]);
    expect(list).toHaveBeenCalledOnce();
  });

  it("passes the drive id and paging options to the files client", async () => {
    const children = vi.spyOn(webFilesClient, "listDriveChildren").mockResolvedValue(PAGE);

    await expect(listDriveChildren(DRIVE_ID, { cursor: "next", limit: 20 })).resolves.toBe(PAGE);
    expect(children).toHaveBeenCalledWith(DRIVE_ID, { cursor: "next", limit: 20 });
  });

  it("passes the folder id to the files client without paging options by default", async () => {
    const children = vi.spyOn(webFilesClient, "listFileChildren").mockResolvedValue(PAGE);

    await expect(listFileChildren(FOLDER_ID)).resolves.toBe(PAGE);
    expect(children).toHaveBeenCalledWith(FOLDER_ID, {});
  });

  it("moves the file to the trash through the files client and returns it", async () => {
    const trashed = { id: FOLDER_ID } as FileEntry;
    const trash = vi.spyOn(webFilesClient, "trashFile").mockResolvedValue(trashed);

    await expect(trashFile(FOLDER_ID)).resolves.toBe(trashed);
    expect(trash).toHaveBeenCalledWith(FOLDER_ID);
  });

  it("passes the file id to the files client and returns the details", async () => {
    const get = vi.spyOn(webFilesClient, "getFile").mockResolvedValue(DETAILS);

    await expect(getFile(FOLDER_ID)).resolves.toBe(DETAILS);
    expect(get).toHaveBeenCalledWith(FOLDER_ID);
  });

  it("uploads a file through the files client with its progress handler", async () => {
    const upload = vi.spyOn(webFilesClient, "uploadFile").mockResolvedValue({} as FileEntry);
    const file = new File(["hello"], "Holiday.txt");
    const onProgress = vi.fn();

    await uploadFile(DRIVE_ID, { file, parentId: FOLDER_ID, onProgress });

    expect(upload).toHaveBeenCalledWith(DRIVE_ID, { file, parentId: FOLDER_ID, onProgress });
  });
  it("lists the versions of a file through the files client", async () => {
    const versions = [{ id: VERSION_ID }] as FileVersion[];
    const list = vi.spyOn(webFilesClient, "listFileVersions").mockResolvedValue(versions);

    await expect(listFileVersions(FOLDER_ID)).resolves.toBe(versions);
    expect(list).toHaveBeenCalledWith(FOLDER_ID);
  });

  it("uploads a new version through the files client with its progress handler", async () => {
    const upload = vi.spyOn(webFilesClient, "uploadFileVersion").mockResolvedValue({} as FileEntry);
    const file = new File(["hello"], "Holiday.txt");
    const onProgress = vi.fn();

    await uploadFileVersion(FOLDER_ID, { file, onProgress });

    expect(upload).toHaveBeenCalledWith(FOLDER_ID, { file, onProgress });
  });

  it("restores a version through the files client", async () => {
    const restored = {} as FileEntry;
    const restore = vi.spyOn(webFilesClient, "restoreFileVersion").mockResolvedValue(restored);

    await expect(restoreFileVersion(FOLDER_ID, VERSION_ID)).resolves.toBe(restored);
    expect(restore).toHaveBeenCalledWith(FOLDER_ID, VERSION_ID);
  });

  it("deletes a version through the files client", async () => {
    const remove = vi.spyOn(webFilesClient, "deleteFileVersion").mockResolvedValue(undefined);

    await expect(deleteFileVersion(FOLDER_ID, VERSION_ID)).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith(FOLDER_ID, VERSION_ID);
  });

  it("returns the content of a version from the files client as a blob", async () => {
    const content = new Blob(["hello"]);
    const download = vi.spyOn(webFilesClient, "downloadFileVersion").mockResolvedValue(content);

    await expect(getFileVersionContent(FOLDER_ID, VERSION_ID)).resolves.toBe(content);
    expect(download).toHaveBeenCalledWith(FOLDER_ID, VERSION_ID);
  });

  it("passes the file id and the disposition to the files client and returns the blob", async () => {
    const blob = new Blob(["hello"]);
    const read = vi.spyOn(webFilesClient, "getFileContent").mockResolvedValue(blob);

    await expect(getFileContent(FOLDER_ID, { disposition: "inline" })).resolves.toBe(blob);
    expect(read).toHaveBeenCalledWith(FOLDER_ID, { disposition: "inline" });
  });
});
