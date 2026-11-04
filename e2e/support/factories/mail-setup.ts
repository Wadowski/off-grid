// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { Session } from "./instance-admin.js";

export const APP_PASSWORD = "abcd efgh ijkl mnop";

const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

export function readMailSettings(api: APIRequestContext, session: Session): Promise<APIResponse> {
  return api.get("/api/admin/mail-settings", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
}

export function saveMailSettings(
  api: APIRequestContext,
  session: Session,
  settings: Record<string, unknown>,
): Promise<APIResponse> {
  return api.put("/api/admin/mail-settings", {
    headers: bearer(session),
    data: settings,
    failOnStatusCode: false,
  });
}
