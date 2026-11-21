// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { Session } from "../factories/instance-admin.js";
import { bearerHeaders } from "./bearer-headers.js";
import { NIGHTLY_PATH } from "./constants.js";

export const requestNightlyUpdate = (
  api: APIRequestContext,
  session: Session,
  enabled: boolean,
): Promise<APIResponse> =>
  api.put(NIGHTLY_PATH, {
    headers: bearerHeaders(session),
    data: { enabled },
    failOnStatusCode: false,
  });
