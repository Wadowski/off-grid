// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readJsonBody } from "./read-json-body.js";
import { toApiError } from "./to-api-error.js";
import type { UploadOptions, UploadTransport } from "./types.js";

export const uploadBytes = async (
  sendUpload: UploadTransport,
  baseUrl: string,
  path: string,
  body: Blob,
  headers: Readonly<Record<string, string>>,
  options: UploadOptions,
): Promise<unknown> => {
  const response = await sendUpload(`${baseUrl}${path}`, {
    method: "POST",
    headers: { accept: "application/json", ...headers },
    body,
    onProgress: options.onProgress,
    signal: options.signal,
  });
  if (response.ok) {
    return readJsonBody(response);
  }
  throw await toApiError(response);
};
