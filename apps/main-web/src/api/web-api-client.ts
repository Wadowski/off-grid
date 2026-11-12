// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  createAdminClient,
  createApiClient,
  createAuthClient,
  createCalendarClient,
} from "@offgrid/api-client";
import { API_PATH } from "../constants.js";
import { sendWithSession } from "../session/send-with-session.js";
import { serverOrigin } from "./server-origin.js";

export const webApiClient = createApiClient({
  baseUrl: `${serverOrigin()}${API_PATH}`,
  fetch: sendWithSession,
});

export const webAuthClient = createAuthClient(webApiClient);
export const webAdminClient = createAdminClient(webApiClient);
export const webCalendarClient = createCalendarClient(webApiClient);
