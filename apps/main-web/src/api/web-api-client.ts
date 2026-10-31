// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient } from "@offgrid/api-client";
import { API_PATH } from "../constants.js";
import { withDevIdentity } from "./with-dev-identity.js";

export const webApiClient = createApiClient({
  baseUrl: API_PATH,
  fetch: (input, init) => fetch(input, { ...init, headers: withDevIdentity(init?.headers) }),
});
