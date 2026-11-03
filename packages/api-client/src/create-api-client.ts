// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { requestApi } from "./request-api.js";
import type { ApiClient, ApiClientOptions } from "./types.js";

export const createApiClient = ({
  baseUrl,
  fetch: transport = fetch,
}: ApiClientOptions): ApiClient => ({
  request: (method, path, body, headers) =>
    requestApi(transport, baseUrl, method, path, body, headers),
});
