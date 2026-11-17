// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApiClientOptions, HttpMethod } from "./types.js";
import { readJsonBody } from "./read-json-body.js";
import { toApiError } from "./to-api-error.js";

export const requestBytes = async (
  transport: NonNullable<ApiClientOptions["fetch"]>,
  baseUrl: string,
  method: HttpMethod,
  path: string,
  body: Uint8Array | Blob,
  extraHeaders?: Readonly<Record<string, string>>,
): Promise<unknown> => {
  const response = await transport(`${baseUrl}${path}`, {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/offset+octet-stream",
      ...extraHeaders,
    },
    body,
  });
  if (response.ok) {
    return readJsonBody(response);
  }
  throw await toApiError(response);
};
