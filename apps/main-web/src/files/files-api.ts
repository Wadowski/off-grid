// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileContentOptions, UploadFileInput } from "@offgrid/api-client";
import { webFilesClient } from "../api/web-api-client.js";
import type {
  Drive,
  FileDetails,
  FileEntry,
  FileListOptions,
  FileListPage,
  FileVersion,
} from "./types.js";

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

export const listFileVersions = (fileId: FileEntry["id"]): Promise<readonly FileVersion[]> =>
  webFilesClient.listFileVersions(fileId);

export const uploadFile = (driveId: Drive["id"], input: UploadFileInput): Promise<FileEntry> =>
  webFilesClient.uploadFile(driveId, input);

export const getFileContent = (
  fileId: FileEntry["id"],
  options: FileContentOptions,
): Promise<Blob> => webFilesClient.getFileContent(fileId, options);
