// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { UPDATER_REQUEST_TIMEOUT_MS } from "../../constants.js";
import { UpdaterUnavailableError } from "../../application/errors/updater-unavailable-error.js";
import type { Fetcher, UpdaterRequest, UpdaterSettings } from "../../types.js";

export const sendUpdaterRequest = async (
  settings: UpdaterSettings,
  fetcher: Fetcher,
  request: UpdaterRequest,
): Promise<Response> => {
  try {
    return await fetcher(new URL(request.path, settings.url), {
      method: request.method,
      headers: {
        authorization: `Bearer ${settings.token}`,
        ...(request.body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      redirect: "error",
      signal: AbortSignal.timeout(UPDATER_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new UpdaterUnavailableError();
  }
};
