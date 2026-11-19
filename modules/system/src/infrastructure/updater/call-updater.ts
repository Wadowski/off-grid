// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";
import { UpdaterFailedError } from "../../application/errors/updater-failed-error.js";
import type { Fetcher, UpdaterRequest, UpdaterSettings } from "../../types.js";
import { parseUpdaterError } from "./parse-updater-error.js";
import { readUpdaterPayload } from "./read-updater-payload.js";
import { sendUpdaterRequest } from "./send-updater-request.js";
import { UpdaterUnavailableError } from "../../application/errors/updater-unavailable-error.js";

export const callUpdater = async <Reply>(
  settings: UpdaterSettings | null,
  fetcher: Fetcher,
  request: UpdaterRequest,
  replySchema: z.ZodType<Reply>,
): Promise<Reply> => {
  if (settings === null) {
    throw new UpdaterUnavailableError();
  }
  const response = await sendUpdaterRequest(settings, fetcher, request);
  const payload = await readUpdaterPayload(response);
  if (!response.ok) {
    throw parseUpdaterError(response.status, payload);
  }
  const parsed = replySchema.safeParse(payload);
  if (!parsed.success) {
    throw new UpdaterFailedError("UPDATER_ERROR");
  }
  return parsed.data;
};
