// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { Session } from "../factories/instance-admin.js";
import { bearerHeaders } from "./bearer-headers.js";
import { UPDATE_APPLY_PATH } from "./constants.js";

export const requestUpdateApply = (
  api: APIRequestContext,
  session: Session,
): Promise<APIResponse> =>
  api.post(UPDATE_APPLY_PATH, { headers: bearerHeaders(session), failOnStatusCode: false });
