// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient } from "@offgrid/api-client";

export type ApiClient = ReturnType<typeof createApiClient>;

// Factories and Given steps use the public API, the same way a user does.
export function apiClientFor(baseUrl: string): ApiClient {
  return createApiClient({ baseUrl });
}
