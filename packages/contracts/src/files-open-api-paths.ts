// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveParamsSchema } from "./drive-params-schema.js";
import { fileListQuerySchema } from "./file-list-query-schema.js";
import { fileParamsSchema } from "./file-params-schema.js";
import { fileVersionParamsSchema } from "./file-version-params-schema.js";

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const binaryContent = {
  "application/octet-stream": { schema: { type: "string", format: "binary" } },
};

const errorResponse = (description: string) => ({
  description,
  content: jsonContent("ErrorResponse"),
});

const unauthenticated = errorResponse("UNAUTHENTICATED: the request has no signed-in person.");

const notFound = errorResponse(
  "NOT_FOUND: the drive, file or version does not exist or the person cannot see it. Hidden items are never reported as forbidden.",
);

const validationFailed = errorResponse(
  "VALIDATION_FAILED: a path parameter, query value or body does not match the request schema.",
);

const nameTaken = errorResponse(
  "NAME_TAKEN: another live entry in the same folder already has this name.",
);

const notTrashed = errorResponse("NOT_TRASHED: the file is not in the trash.");

const isFolder = errorResponse("IS_FOLDER: the target is a folder and has no content.");

const driveIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(driveParamsSchema.shape.id),
};

const fileIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(fileParamsSchema.shape.id),
};

const fileVersionIdParameter = {
  name: "versionId",
  in: "path",
  required: true,
  schema: z.toJSONSchema(fileVersionParamsSchema.shape.versionId),
};

const listQueryParameters = [
  {
    name: "cursor",
    in: "query",
    required: false,
    schema: z.toJSONSchema(fileListQuerySchema.shape.cursor.unwrap()),
  },
  {
    name: "limit",
    in: "query",
    required: false,
    schema: z.toJSONSchema(fileListQuerySchema.shape.limit),
  },
];

const contentHeaders = {
  "Content-Disposition": {
    description: "The file name for the download, as an attachment.",
    schema: { type: "string" },
  },
};

const downloadResponses = {
  "200": { description: "The whole file.", headers: contentHeaders, content: binaryContent },
  "206": {
    description: "The requested byte range, when the request sent a Range header.",
    headers: contentHeaders,
    content: binaryContent,
  },
  "400": isFolder,
  "401": unauthenticated,
  "404": notFound,
};

export const filesOpenApiPaths = {
  "/drives": {
    get: {
      operationId: "listDrives",
      summary: "List the drives the signed-in person can access",
      responses: {
        "200": { description: "The drives.", content: jsonContent("DriveList") },
        "401": unauthenticated,
      },
    },
  },
  "/drives/{id}/children": {
    get: {
      operationId: "listDriveChildren",
      summary: "List the entries at the root of a drive, folders first, then by name",
      parameters: [driveIdParameter, ...listQueryParameters],
      responses: {
        "200": { description: "One page of entries.", content: jsonContent("FileList") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
  "/drives/{id}/folders": {
    post: {
      operationId: "createFolder",
      summary: "Create a folder at the root of a drive or inside a folder of the drive",
      parameters: [driveIdParameter],
      requestBody: { required: true, content: jsonContent("CreateFolderRequest") },
      responses: {
        "201": { description: "The created folder.", content: jsonContent("File") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": nameTaken,
      },
    },
  },
  "/drives/{id}/trash": {
    get: {
      operationId: "listDriveTrash",
      summary: "List the trashed entries of a drive",
      parameters: [driveIdParameter, ...listQueryParameters],
      responses: {
        "200": { description: "One page of trashed entries.", content: jsonContent("FileList") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
  "/files/{id}": {
    get: {
      operationId: "getFile",
      summary: "Get a file or folder with its breadcrumbs",
      parameters: [fileIdParameter],
      responses: {
        "200": { description: "The entry.", content: jsonContent("FileDetails") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
    patch: {
      operationId: "renameFile",
      summary: "Rename a file or folder",
      parameters: [fileIdParameter],
      requestBody: { required: true, content: jsonContent("RenameFileRequest") },
      responses: {
        "200": { description: "The renamed entry.", content: jsonContent("File") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": nameTaken,
      },
    },
    delete: {
      operationId: "purgeFile",
      summary: "Permanently delete a trashed file or folder with its versions",
      parameters: [fileIdParameter],
      responses: {
        "204": { description: "The entry was permanently deleted." },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": notTrashed,
      },
    },
  },
  "/files/{id}/children": {
    get: {
      operationId: "listFileChildren",
      summary: "List the entries inside a folder, folders first, then by name",
      parameters: [fileIdParameter, ...listQueryParameters],
      responses: {
        "200": { description: "One page of entries.", content: jsonContent("FileList") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
  "/files/{id}/move": {
    post: {
      operationId: "moveFile",
      summary: "Move a file or folder to another folder or drive",
      parameters: [fileIdParameter],
      requestBody: { required: true, content: jsonContent("MoveFileRequest") },
      responses: {
        "200": { description: "The moved entry.", content: jsonContent("MoveFileResult") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": errorResponse(
          "INVALID_MOVE: a folder cannot move into itself or into its own subtree. NAME_TAKEN: the target folder already has this name.",
        ),
      },
    },
  },
  "/files/{id}/content": {
    get: {
      operationId: "downloadFile",
      summary: "Download the current version of a file",
      parameters: [fileIdParameter],
      responses: downloadResponses,
    },
  },
  "/files/{id}/trash": {
    post: {
      operationId: "trashFile",
      summary: "Move a file or folder to the trash",
      parameters: [fileIdParameter],
      responses: {
        "200": { description: "The trashed entry.", content: jsonContent("File") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
  "/files/{id}/restore": {
    post: {
      operationId: "restoreFile",
      summary: "Restore a trashed file or folder",
      parameters: [fileIdParameter],
      responses: {
        "200": { description: "The restored entry.", content: jsonContent("File") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": {
          description:
            "NOT_TRASHED: the entry is not in the trash. NAME_TAKEN: another live entry in its folder now has this name.",
          content: jsonContent("ErrorResponse"),
        },
      },
    },
  },
  "/files/{id}/versions": {
    get: {
      operationId: "listFileVersions",
      summary: "List the versions of a file, newest first",
      parameters: [fileIdParameter],
      responses: {
        "200": { description: "The versions.", content: jsonContent("FileVersionList") },
        "400": isFolder,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
  "/files/{id}/versions/{versionId}/content": {
    get: {
      operationId: "downloadFileVersion",
      summary: "Download one version of a file",
      parameters: [fileIdParameter, fileVersionIdParameter],
      responses: downloadResponses,
    },
  },
  "/files/{id}/versions/{versionId}/restore": {
    post: {
      operationId: "restoreFileVersion",
      summary: "Make an earlier version the current version of a file",
      parameters: [fileIdParameter, fileVersionIdParameter],
      responses: {
        "200": {
          description: "The file with its restored current version.",
          content: jsonContent("File"),
        },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
} as const;
