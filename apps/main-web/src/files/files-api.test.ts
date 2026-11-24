// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { webFilesClient } from "../api/web-api-client.js";
import {
  getFile,
  getFileContent,
  listDriveChildren,
  listDrives,
  listFileChildren,
  uploadFile,
} from "./files-api.js";
import type { Drive, FileDetails, FileEntry, FileListPage } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const DRIVE: Drive = {
  id: DRIVE_ID,
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Drive;
const PAGE: FileListPage = { items: [], breadcrumbs: [], nextCursor: null } as FileListPage;
const DETAILS: FileDetails = { file: {} as FileEntry, breadcrumbs: [] } as FileDetails;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("files API", () => {
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

  it("passes the file id and the disposition to the files client and returns the blob", async () => {
    const blob = new Blob(["hello"]);
    const read = vi.spyOn(webFilesClient, "getFileContent").mockResolvedValue(blob);

    await expect(getFileContent(FOLDER_ID, { disposition: "inline" })).resolves.toBe(blob);
    expect(read).toHaveBeenCalledWith(FOLDER_ID, { disposition: "inline" });
  });
});
