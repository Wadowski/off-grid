// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient, createAuthClient } from "@offgrid/api-client";
import { API_PATH } from "../constants.js";
import { serverOrigin } from "./server-origin.js";

export const anonymousApiClient = createApiClient({
  baseUrl: `${serverOrigin()}${API_PATH}`,
  fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
});

export const anonymousAuthClient = createAuthClient(anonymousApiClient);
