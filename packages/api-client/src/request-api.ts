// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApiClientOptions, HttpMethod } from "./types.js";
import { requestHeaders } from "./request-headers.js";
import { toApiError } from "./to-api-error.js";

export const requestApi = async (
  transport: NonNullable<ApiClientOptions["fetch"]>,
  baseUrl: string,
  method: HttpMethod,
  path: string,
  body?: unknown,
  extraHeaders?: Readonly<Record<string, string>>,
): Promise<unknown> => {
  const response = await transport(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders(body, extraHeaders),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.ok) {
    return response.status === 204 ? undefined : response.json();
  }
  throw await toApiError(response);
};
