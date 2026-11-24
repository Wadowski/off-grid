// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, createFilesClient } from "./index.js";
import type { UploadInit, UploadTransport } from "./types.js";

const BASE_URL = "http://localhost:3000/api";
const DRIVE_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const FOLDER_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";
const TIMESTAMP = "2026-01-02T03:04:05.000Z";

const CREATED_FILE = {
  id: "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c",
  driveId: DRIVE_ID,
  parentId: FOLDER_ID,
  isFolder: false,
  name: "Café notes.txt",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
  mimeType: "text/plain",
  size: 5,
  currentVersionId: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a",
};

const jsonResponse = (body: unknown, status = 201): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const errorResponse = (status: number, code: string) =>
  jsonResponse({ code, message: `${code} happened.` }, status);

const uploadTransportReturning = (response: Response) => {
  const sendUpload = vi.fn<UploadTransport>().mockResolvedValue(response);
  return {
    sendUpload,
    files: createFilesClient(createApiClient({ baseUrl: BASE_URL, sendUpload })),
  };
};

const sentInit = (sendUpload: ReturnType<typeof vi.fn<UploadTransport>>): UploadInit => {
  const init = sendUpload.mock.calls[0]?.[1];
  if (init === undefined) {
    throw new Error("No upload was sent.");
  }
  return init;
};

describe("createFilesClient.uploadFile", () => {
  it("posts the file to the drive with the encoded name and the parent folder", async () => {
    const { sendUpload, files } = uploadTransportReturning(jsonResponse(CREATED_FILE));
    const file = new File(["hello"], "Café notes.txt", { type: "text/plain" });

    await expect(files.uploadFile(DRIVE_ID, { file, parentId: FOLDER_ID })).resolves.toEqual(
      CREATED_FILE,
    );

    expect(sendUpload).toHaveBeenCalledWith(
      `${BASE_URL}/drives/${DRIVE_ID}/files`,
      expect.objectContaining({ method: "POST", body: file }),
    );
    expect(sentInit(sendUpload).headers).toEqual({
      accept: "application/json",
      "x-offgrid-file-name": encodeURIComponent("Café notes.txt"),
      "x-offgrid-parent-id": FOLDER_ID,
      "content-type": "text/plain",
    });
  });

  it("omits the parent header and the content type when they are not known", async () => {
    const { sendUpload, files } = uploadTransportReturning(jsonResponse(CREATED_FILE));

    await files.uploadFile(DRIVE_ID, { file: new File(["x"], "Plain") });

    const headers = sentInit(sendUpload).headers;
    expect(headers).not.toHaveProperty("x-offgrid-parent-id");
    expect(headers).not.toHaveProperty("content-type");
    expect(headers["x-offgrid-file-name"]).toBe("Plain");
  });

  it("forwards the progress handler and the abort signal to the transport", async () => {
    const { sendUpload, files } = uploadTransportReturning(jsonResponse(CREATED_FILE));
    const onProgress = vi.fn();
    const controller = new AbortController();

    await files.uploadFile(DRIVE_ID, {
      file: new File(["x"], "Plain"),
      onProgress,
      signal: controller.signal,
    });

    expect(sentInit(sendUpload).onProgress).toBe(onProgress);
    expect(sentInit(sendUpload).signal).toBe(controller.signal);
  });

  it("throws an ApiError with the server code for a too large file", async () => {
    const { files } = uploadTransportReturning(errorResponse(413, "PAYLOAD_TOO_LARGE"));

    const error = await files
      .uploadFile(DRIVE_ID, { file: new File(["x"], "Big.bin") })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });
  });

  it("throws an ApiError with the server code for a taken name", async () => {
    const { files } = uploadTransportReturning(errorResponse(409, "NAME_TAKEN"));

    await expect(
      files.uploadFile(DRIVE_ID, { file: new File(["x"], "A.txt") }),
    ).rejects.toMatchObject({ status: 409, code: "NAME_TAKEN" });
  });

  it("sends through the plain byte request without progress when no transport is given", async () => {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(CREATED_FILE));
    const files = createFilesClient(createApiClient({ baseUrl: BASE_URL, fetch: transport }));

    await expect(
      files.uploadFile(DRIVE_ID, { file: new File(["x"], "Plain.txt", { type: "text/plain" }) }),
    ).resolves.toEqual(CREATED_FILE);

    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/drives/${DRIVE_ID}/files`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
