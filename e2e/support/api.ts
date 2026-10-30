// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient } from "@offgrid/api-client";

export type ApiClient = ReturnType<typeof createApiClient>;

export function apiClientFor(baseUrl: string): ApiClient {
  return createApiClient({ baseUrl });
}
