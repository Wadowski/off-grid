// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApiClientOptions, ByteBody, HttpMethod } from "./types.js";
import { readJsonBody } from "./read-json-body.js";
import { toApiError } from "./to-api-error.js";

const OFFSET_OCTET_STREAM = "application/offset+octet-stream";

export const requestBytes = async (
  transport: NonNullable<ApiClientOptions["fetch"]>,
  baseUrl: string,
  method: HttpMethod,
  path: string,
  body: ByteBody,
  extraHeaders?: Readonly<Record<string, string>>,
  contentType: string | null = OFFSET_OCTET_STREAM,
): Promise<unknown> => {
  const response = await transport(`${baseUrl}${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...extraHeaders,
      ...(contentType === null ? {} : { "content-type": contentType }),
    },
    body,
  });
  if (response.ok) {
    return readJsonBody(response);
  }
  throw await toApiError(response);
};
