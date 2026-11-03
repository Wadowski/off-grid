// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { ApiError } from "./api-error.js";
export {
  CLIENT_REQUEST_HEADERS,
  createAuthClient,
  type AuthClient,
  type RegisterInput,
  type SignInInput,
} from "./auth-client.js";
export { createApiClient, type ApiClient } from "./create-api-client.js";
export type { components, paths } from "./generated/schema.js";
