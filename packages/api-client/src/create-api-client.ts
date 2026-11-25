// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { requestApi } from "./request-api.js";
import { requestBlob } from "./request-blob.js";
import { requestBytes } from "./request-bytes.js";
import { uploadBytes } from "./upload-bytes.js";
import type { ApiClient, ApiClientOptions } from "./types.js";

export const createApiClient = ({
  baseUrl,
  fetch: transport = fetch,
  sendUpload,
}: ApiClientOptions): ApiClient => ({
  request: (method, path, body, headers) =>
    requestApi(transport, baseUrl, method, path, body, headers),
  requestBytes: (method, path, body, headers, contentType) =>
    requestBytes(transport, baseUrl, method, path, body, headers, contentType),
  requestBlob: (path) => requestBlob(transport, baseUrl, path),
  uploadBytes: (path, body, headers, options) =>
    sendUpload === undefined
      ? requestBytes(transport, baseUrl, "POST", path, body, headers, null)
      : uploadBytes(sendUpload, baseUrl, path, body, headers, options),
});
