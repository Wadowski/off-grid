// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { requestApi } from "./request-api.js";
import type { ApiClientOptions, HttpMethod } from "./types.js";

export const createApiClient = ({ baseUrl, fetch: transport = fetch }: ApiClientOptions) => ({
  request: (method: HttpMethod, path: string, body?: unknown): Promise<unknown> =>
    requestApi(transport, baseUrl, method, path, body),
});
