// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, createFilesClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";
const DRIVE_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const FOLDER_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";
const FILE_ID = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";
const VERSION_ID = "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a";
const UPLOAD_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const USER_ID = "2e3f4a5b-6c7d-4e8f-9a0b-1c2d3e4f5a6b";
const TIMESTAMP = "2026-01-02T03:04:05.000Z";

const DRIVE = { id: DRIVE_ID, familyId: null, createdAt: TIMESTAMP };

const FOLDER = {
  id: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  isFolder: true,
  name: "Photos",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
};

const FILE = {
  id: FILE_ID,
  driveId: DRIVE_ID,
  parentId: FOLDER_ID,
  isFolder: false,
  name: "Report.pdf",
  version: 2,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: VERSION_ID,
};

const VERSION = {
  id: VERSION_ID,
  fileId: FILE_ID,
  number: 1,
  size: 2048,
  mimeType: "application/pdf",
  createdByUserId: USER_ID,
  createdAt: TIMESTAMP,
};

const UPLOAD = { uploadId: UPLOAD_ID, offset: 0, file: null };

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const emptyResponse = (status: number): Response => new Response(null, { status });

const filesWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { files: createFilesClient(client), transport };
};

describe("createFilesClient listing", () => {
  it("lists the drives and returns the drive array", async () => {
    const { files, transport } = filesWith(jsonResponse({ drives: [DRIVE] }));

    await expect(files.listDrives()).resolves.toEqual([DRIVE]);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/drives`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a drive list that does not match the contract", async () => {
    const { files } = filesWith(jsonResponse({ drives: [{ id: DRIVE_ID }] }));

    await expect(files.listDrives()).rejects.toThrow();
  });

  it("encodes the drive id and sends the cursor and limit as a query", async () => {
    const page = { items: [FOLDER], breadcrumbs: [], nextCursor: null };
    const { files, transport } = filesWith(jsonResponse(page));

    await expect(files.listDriveChildren(DRIVE_ID, { cursor: "next", limit: 20 })).resolves.toEqual(
      page,
    );
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/drives/${DRIVE_ID}/children?cursor=next&limit=20`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("lists the trash of a drive", async () => {
    const page = { items: [], breadcrumbs: [], nextCursor: null };
    const { files, transport } = filesWith(jsonResponse(page));

    await expect(files.listDriveTrash(DRIVE_ID)).resolves.toEqual(page);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/drives/${DRIVE_ID}/trash`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("lists the children of a folder", async () => {
    const page = {
      items: [FILE],
      breadcrumbs: [{ id: FOLDER_ID, name: "Photos" }],
      nextCursor: null,
    };
    const { files, transport } = filesWith(jsonResponse(page));

    await expect(files.listFileChildren(FOLDER_ID)).resolves.toEqual(page);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FOLDER_ID}/children`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("createFilesClient entries", () => {
  it("creates a folder by posting its name and parent", async () => {
    const { files, transport } = filesWith(jsonResponse(FOLDER, 201));

    await expect(files.createFolder(DRIVE_ID, { parentId: null, name: "Photos" })).resolves.toEqual(
      FOLDER,
    );
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/drives/${DRIVE_ID}/folders`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ parentId: null, name: "Photos" }),
      }),
    );
  });

  it("gets a file with its breadcrumbs", async () => {
    const details = { file: FILE, breadcrumbs: [{ id: FOLDER_ID, name: "Photos" }] };
    const { files, transport } = filesWith(jsonResponse(details));

    await expect(files.getFile(FILE_ID)).resolves.toEqual(details);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("renames a file with a patch", async () => {
    const { files, transport } = filesWith(jsonResponse({ ...FILE, name: "Final.pdf" }));

    await expect(files.renameFile(FILE_ID, { name: "Final.pdf" })).resolves.toMatchObject({
      name: "Final.pdf",
    });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}`,
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Final.pdf" }) }),
    );
  });

  it("moves a file and returns the cross-owner notice", async () => {
    const result = { file: FILE, crossOwnerNotice: false };
    const { files, transport } = filesWith(jsonResponse(result));

    await expect(files.moveFile(FILE_ID, { driveId: DRIVE_ID, parentId: null })).resolves.toEqual(
      result,
    );
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}/move`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ driveId: DRIVE_ID, parentId: null }),
      }),
    );
  });

  it("trashes and restores a file", async () => {
    const trashed = { ...FILE, deletedAt: TIMESTAMP };
    const trashCall = filesWith(jsonResponse(trashed));

    await expect(trashCall.files.trashFile(FILE_ID)).resolves.toEqual(trashed);
    expect(trashCall.transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}/trash`,
      expect.objectContaining({ method: "POST" }),
    );

    const restoreCall = filesWith(jsonResponse(FILE));

    await expect(restoreCall.files.restoreFile(FILE_ID)).resolves.toEqual(FILE);
    expect(restoreCall.transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}/restore`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("purges a file with DELETE and resolves without a body", async () => {
    const { files, transport } = filesWith(emptyResponse(204));

    await expect(files.purgeFile(FILE_ID)).resolves.toBeUndefined();
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

describe("createFilesClient versions and downloads", () => {
  it("lists the versions of a file", async () => {
    const { files, transport } = filesWith(jsonResponse({ versions: [VERSION] }));

    await expect(files.listFileVersions(FILE_ID)).resolves.toEqual([VERSION]);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}/versions`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("restores a version by its path", async () => {
    const { files, transport } = filesWith(jsonResponse(FILE));

    await expect(files.restoreFileVersion(FILE_ID, VERSION_ID)).resolves.toEqual(FILE);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/files/${FILE_ID}/versions/${VERSION_ID}/restore`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("builds the current and the versioned download paths without fetching", () => {
    const { files, transport } = filesWith(jsonResponse({}));

    expect(files.downloadUrl(FILE_ID)).toBe(`/files/${FILE_ID}/content`);
    expect(files.downloadUrl(FILE_ID, VERSION_ID)).toBe(
      `/files/${FILE_ID}/versions/${VERSION_ID}/content`,
    );
    expect(transport).not.toHaveBeenCalled();
  });
});

describe("createFilesClient uploads", () => {
  it("opens an upload session with the JSON body", async () => {
    const body = {
      driveId: DRIVE_ID,
      parentId: FOLDER_ID,
      name: "Report.pdf",
      mimeType: "application/pdf",
      size: 2048,
    };
    const { files, transport } = filesWith(jsonResponse(UPLOAD, 201));

    await expect(files.createUpload(body)).resolves.toEqual(UPLOAD);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/uploads`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(body) }),
    );
  });

  it("reads how many bytes an upload has received", async () => {
    const { files, transport } = filesWith(jsonResponse({ ...UPLOAD, offset: 1024 }));

    await expect(files.getUpload(UPLOAD_ID)).resolves.toMatchObject({ offset: 1024 });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/uploads/${UPLOAD_ID}`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends a chunk as raw bytes with the offset header and the octet-stream type", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const { files, transport } = filesWith(jsonResponse({ ...UPLOAD, offset: 3 }));

    await expect(files.uploadChunk(UPLOAD_ID, 0, bytes)).resolves.toMatchObject({ offset: 3 });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/uploads/${UPLOAD_ID}`,
      expect.objectContaining({
        method: "PATCH",
        body: bytes,
        headers: expect.objectContaining({
          "content-type": "application/offset+octet-stream",
          "Upload-Offset": "0",
        }),
      }),
    );
  });

  it("keeps the octet-stream content type when a caller header tries to override it", async () => {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(UPLOAD));
    const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });

    await client.requestBytes("PATCH", "/uploads/x", new Uint8Array([1]), {
      "content-type": "text/plain",
    });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/uploads/x`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "content-type": "application/offset+octet-stream",
        }),
      }),
    );
  });

  it("aborts an upload with DELETE", async () => {
    const { files, transport } = filesWith(emptyResponse(204));

    await expect(files.abortUpload(UPLOAD_ID)).resolves.toBeUndefined();
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/uploads/${UPLOAD_ID}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

describe("createFilesClient errors", () => {
  it("maps a 409 name collision to an ApiError with its code", async () => {
    const { files } = filesWith(
      jsonResponse({ code: "NAME_TAKEN", message: "Another entry has this name." }, 409),
    );

    const error = await files
      .createFolder(DRIVE_ID, { parentId: null, name: "Photos" })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "NAME_TAKEN" });
  });

  it("maps a 404 for a hidden file to NOT_FOUND", async () => {
    const { files } = filesWith(jsonResponse({ code: "NOT_FOUND", message: "Not found." }, 404));

    await expect(files.getFile(FILE_ID)).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });
});
