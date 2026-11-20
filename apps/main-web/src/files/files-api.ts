// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webFilesClient } from "../api/web-api-client.js";
import type { Drive, FileDetails, FileEntry, FileListOptions, FileListPage } from "./types.js";

export const listDrives = (): Promise<readonly Drive[]> => webFilesClient.listDrives();

export const listDriveChildren = (
  driveId: Drive["id"],
  options: FileListOptions = {},
): Promise<FileListPage> => webFilesClient.listDriveChildren(driveId, options);

export const listFileChildren = (
  fileId: FileEntry["id"],
  options: FileListOptions = {},
): Promise<FileListPage> => webFilesClient.listFileChildren(fileId, options);

export const getFile = (fileId: FileEntry["id"]): Promise<FileDetails> =>
  webFilesClient.getFile(fileId);
