// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApiClientOptions } from "./types.js";
import { toApiError } from "./to-api-error.js";

export const requestBlob = async (
  transport: NonNullable<ApiClientOptions["fetch"]>,
  baseUrl: string,
  path: string,
): Promise<Blob> => {
  const response = await transport(`${baseUrl}${path}`, {
    method: "GET",
    headers: { accept: "*/*" },
  });
  if (response.ok) {
    return response.blob();
  }
  throw await toApiError(response);
};
