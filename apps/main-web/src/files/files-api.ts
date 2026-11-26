// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  FileContentOptions,
  UploadFileInput,
  UploadFileVersionInput,
} from "@offgrid/api-client";
import type { CreateFolderRequest, MoveFileRequest, RenameFileRequest } from "@offgrid/contracts";
import { webFilesClient } from "../api/web-api-client.js";
import type {
  Drive,
  FileDetails,
  FileEntry,
  FileListOptions,
  FileListPage,
  FileVersion,
  MoveFileResult,
  TrashListOptions,
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

export const createFolder = (
  driveId: Drive["id"],
  input: CreateFolderRequest,
): Promise<FileEntry> => webFilesClient.createFolder(driveId, input);

export const moveFile = (
  fileId: FileEntry["id"],
  input: MoveFileRequest,
): Promise<MoveFileResult> => webFilesClient.moveFile(fileId, input);
export const renameFile = (fileId: FileEntry["id"], input: RenameFileRequest): Promise<FileEntry> =>
  webFilesClient.renameFile(fileId, input);

export const trashFile = (fileId: FileEntry["id"]): Promise<FileEntry> =>
  webFilesClient.trashFile(fileId);

export const listDriveTrash = (
  driveId: Drive["id"],
  options: TrashListOptions = {},
): Promise<FileListPage> => webFilesClient.listDriveTrash(driveId, options);

export const restoreFile = (fileId: FileEntry["id"]): Promise<FileEntry> =>
  webFilesClient.restoreFile(fileId);

export const uploadFile = (driveId: Drive["id"], input: UploadFileInput): Promise<FileEntry> =>
  webFilesClient.uploadFile(driveId, input);

export const uploadFileVersion = (
  fileId: FileEntry["id"],
  input: UploadFileVersionInput,
): Promise<FileEntry> => webFilesClient.uploadFileVersion(fileId, input);

export const restoreFileVersion = (
  fileId: FileEntry["id"],
  versionId: FileVersion["id"],
): Promise<FileEntry> => webFilesClient.restoreFileVersion(fileId, versionId);

export const deleteFileVersion = (
  fileId: FileEntry["id"],
  versionId: FileVersion["id"],
): Promise<void> => webFilesClient.deleteFileVersion(fileId, versionId);

export const getFileVersionContent = (
  fileId: FileEntry["id"],
  versionId: FileVersion["id"],
): Promise<Blob> => webFilesClient.downloadFileVersion(fileId, versionId);
export const getFileContent = (
  fileId: FileEntry["id"],
  options: FileContentOptions,
): Promise<Blob> => webFilesClient.getFileContent(fileId, options);
