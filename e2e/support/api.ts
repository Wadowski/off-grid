// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient } from "@offgrid/api-client";

export type ApiClient = ReturnType<typeof createApiClient>;

const USER_ID_HEADER = "x-offgrid-dev-user-id";

export function apiClientFor(baseUrl: string, userId?: string): ApiClient {
  if (userId === undefined) {
    return createApiClient({ baseUrl });
  }
  return createApiClient({
    baseUrl,
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set(USER_ID_HEADER, userId);
      return fetch(input, { ...init, headers });
    },
  });
}
