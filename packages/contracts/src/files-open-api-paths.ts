// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveParamsSchema } from "./drive-params-schema.js";
import { fileIdSchema } from "./file-id-schema.js";
import { fileListQuerySchema } from "./file-list-query-schema.js";
import { fileParamsSchema } from "./file-params-schema.js";
import { fileVersionParamsSchema } from "./file-version-params-schema.js";
import { uploadParamsSchema } from "./upload-params-schema.js";
import { FILE_NAME_HEADER, PARENT_ID_HEADER } from "./upload-headers.js";

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

const payloadTooLarge = errorResponse(
  "PAYLOAD_TOO_LARGE: the file is larger than the configured upload limit. Nothing is stored.",
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

const uploadIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(uploadParamsSchema.shape.id),
};

const uploadOffsetHeader = {
  name: "Upload-Offset",
  in: "header",
  required: true,
  description:
    "The byte offset at which the body starts. It must equal the offset the server reports.",
  schema: { type: "integer", minimum: 0 },
};

const uploadFileNameHeader = {
  name: FILE_NAME_HEADER,
  in: "header",
  required: true,
  description: "The name of the new file, percent-encoded (RFC 3986).",
  schema: { type: "string" },
};

const uploadParentIdHeader = {
  name: PARENT_ID_HEADER,
  in: "header",
  required: false,
  description: "The id of the folder that receives the file. Absent means the root of the drive.",
  schema: z.toJSONSchema(fileIdSchema),
};

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
  "/drives/{id}/files": {
    post: {
      operationId: "uploadFile",
      summary:
        "Upload a file as a new entry at the root of a drive or inside a folder of the drive",
      description:
        "The body is the file bytes as they are. The declared Content-Type is the media type of the file; without it the type comes from the file name extension, then application/octet-stream.",
      parameters: [driveIdParameter, uploadFileNameHeader, uploadParentIdHeader],
      requestBody: {
        required: true,
        content: { "*/*": { schema: { type: "string", format: "binary" } } },
      },
      responses: {
        "201": { description: "The created file.", content: jsonContent("File") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": nameTaken,
        "413": payloadTooLarge,
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
        "200": {
          description:
            "The moved entry. A move to a drive of another owner copies the entry and its subtree, removes the source, and sets crossOwnerNotice to true.",
          content: jsonContent("MoveFileResult"),
        },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": errorResponse(
          "INVALID_MOVE: a folder cannot move into itself or into its own subtree, the subtree is larger than the move limit, or the source changed during a cross-owner move. NAME_TAKEN: the target folder already has this name.",
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
  "/uploads": {
    post: {
      operationId: "createUpload",
      summary: "Start a resumable upload of a new file or a new version of an existing file",
      requestBody: { required: true, content: jsonContent("CreateUploadRequest") },
      responses: {
        "201": {
          description: "The upload session. Send the bytes with PATCH.",
          content: jsonContent("Upload"),
        },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": nameTaken,
      },
    },
  },
  "/uploads/{id}": {
    get: {
      operationId: "getUpload",
      summary: "Read how many bytes an upload session has received",
      parameters: [uploadIdParameter],
      responses: {
        "200": { description: "The upload session.", content: jsonContent("Upload") },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
    patch: {
      operationId: "appendUploadBytes",
      summary:
        "Append bytes to an upload session; the request that completes the file returns the file",
      parameters: [uploadIdParameter, uploadOffsetHeader],
      requestBody: {
        required: true,
        content: {
          "application/offset+octet-stream": { schema: { type: "string", format: "binary" } },
        },
      },
      responses: {
        "200": {
          description: "The session, with the file once every byte has arrived.",
          content: jsonContent("Upload"),
        },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
        "409": errorResponse(
          "UPLOAD_OFFSET_MISMATCH: the Upload-Offset header does not equal the bytes received so far. NAME_TAKEN: another live entry in the folder took the name before the upload completed.",
        ),
      },
    },
    delete: {
      operationId: "abortUpload",
      summary: "Abort an upload session and discard the bytes it received",
      parameters: [uploadIdParameter],
      responses: {
        "204": { description: "The session was aborted." },
        "400": validationFailed,
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
} as const;
