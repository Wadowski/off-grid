// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  CreateFolderRequest,
  CreateUploadRequest,
  MoveFileRequest,
  RenameFileRequest,
} from "@offgrid/contracts";
import {
  driveListSchema,
  fileDetailsSchema,
  fileListSchema,
  fileSchema,
  fileVersionListSchema,
  filesRoutes,
  moveFileResultSchema,
  uploadSchema,
} from "@offgrid/contracts";
import { fillRoute } from "./fill-route.js";
import { uploadFileRequest } from "./upload-file-request.js";
import { withListQuery } from "./with-list-query.js";
import type {
  ApiClient,
  ByteBody,
  FileListOptions,
  TrashListOptions,
  UploadFileInput,
} from "./types.js";

export const createFilesClient = (client: ApiClient) => ({
  uploadFile: (driveId: string, input: UploadFileInput) =>
    uploadFileRequest(client, driveId, input),

  listDrives: async () =>
    driveListSchema.parse(await client.request("GET", filesRoutes.drives)).drives,

  listDriveChildren: async (driveId: string, options: FileListOptions = {}) =>
    fileListSchema.parse(
      await client.request(
        "GET",
        withListQuery(fillRoute(filesRoutes.driveChildren, { id: driveId }), options),
      ),
    ),

  listDriveTrash: async (driveId: string, options: TrashListOptions = {}) =>
    fileListSchema.parse(
      await client.request(
        "GET",
        withListQuery(fillRoute(filesRoutes.driveTrash, { id: driveId }), options),
      ),
    ),

  emptyDriveTrash: async (driveId: string): Promise<void> => {
    await client.request("DELETE", fillRoute(filesRoutes.driveTrash, { id: driveId }));
  },

  createFolder: async (driveId: string, input: CreateFolderRequest) =>
    fileSchema.parse(
      await client.request("POST", fillRoute(filesRoutes.driveFolders, { id: driveId }), input),
    ),

  getFile: async (fileId: string) =>
    fileDetailsSchema.parse(
      await client.request("GET", fillRoute(filesRoutes.file, { id: fileId })),
    ),

  listFileChildren: async (fileId: string, options: FileListOptions = {}) =>
    fileListSchema.parse(
      await client.request(
        "GET",
        withListQuery(fillRoute(filesRoutes.fileChildren, { id: fileId }), options),
      ),
    ),

  renameFile: async (fileId: string, input: RenameFileRequest) =>
    fileSchema.parse(
      await client.request("PATCH", fillRoute(filesRoutes.file, { id: fileId }), input),
    ),

  purgeFile: async (fileId: string): Promise<void> => {
    await client.request("DELETE", fillRoute(filesRoutes.file, { id: fileId }));
  },

  moveFile: async (fileId: string, input: MoveFileRequest) =>
    moveFileResultSchema.parse(
      await client.request("POST", fillRoute(filesRoutes.fileMove, { id: fileId }), input),
    ),

  trashFile: async (fileId: string) =>
    fileSchema.parse(
      await client.request("POST", fillRoute(filesRoutes.fileTrash, { id: fileId })),
    ),

  restoreFile: async (fileId: string) =>
    fileSchema.parse(
      await client.request("POST", fillRoute(filesRoutes.fileRestore, { id: fileId })),
    ),

  listFileVersions: async (fileId: string) =>
    fileVersionListSchema.parse(
      await client.request("GET", fillRoute(filesRoutes.fileVersions, { id: fileId })),
    ).versions,

  uploadFileVersion: async (fileId: string, bytes: ByteBody, mimeType?: string) =>
    fileSchema.parse(
      await client.requestBytes(
        "POST",
        fillRoute(filesRoutes.fileVersions, { id: fileId }),
        bytes,
        undefined,
        mimeType ?? null,
      ),
    ),

  deleteFileVersion: async (fileId: string, versionId: string): Promise<void> => {
    await client.request("DELETE", fillRoute(filesRoutes.fileVersion, { id: fileId, versionId }));
  },

  restoreFileVersion: async (fileId: string, versionId: string) =>
    fileSchema.parse(
      await client.request(
        "POST",
        fillRoute(filesRoutes.fileVersionRestore, { id: fileId, versionId }),
      ),
    ),

  downloadUrl: (fileId: string, versionId?: string): string =>
    versionId === undefined
      ? fillRoute(filesRoutes.fileContent, { id: fileId })
      : fillRoute(filesRoutes.fileVersionContent, { id: fileId, versionId }),

  createUpload: async (input: CreateUploadRequest) =>
    uploadSchema.parse(await client.request("POST", filesRoutes.uploads, input)),

  getUpload: async (uploadId: string) =>
    uploadSchema.parse(
      await client.request("GET", fillRoute(filesRoutes.upload, { id: uploadId })),
    ),

  uploadChunk: async (uploadId: string, offset: number, bytes: ByteBody) =>
    uploadSchema.parse(
      await client.requestBytes("PATCH", fillRoute(filesRoutes.upload, { id: uploadId }), bytes, {
        "Upload-Offset": String(offset),
      }),
    ),

  abortUpload: async (uploadId: string): Promise<void> => {
    await client.request("DELETE", fillRoute(filesRoutes.upload, { id: uploadId }));
  },
});
