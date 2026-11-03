// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createApiClient, createAuthClient } from "@offgrid/api-client";
import { API_PATH } from "../constants.js";
import { sendWithSession } from "../session/send-with-session.js";
import { serverOrigin } from "./server-origin.js";

// Requests made as the signed-in person: they carry the access token and the
// family the person is acting in, and renew the session once on a 401.
export const webApiClient = createApiClient({
  baseUrl: `${serverOrigin()}${API_PATH}`,
  fetch: sendWithSession,
});

export const webAuthClient = createAuthClient(webApiClient);
