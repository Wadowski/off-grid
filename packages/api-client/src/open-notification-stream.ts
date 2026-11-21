// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { MISSING_STREAM_BODY_MESSAGE } from "./constants.js";
import { handleStreamFrame } from "./handle-stream-frame.js";
import { readStreamFrames } from "./read-stream-frames.js";
import { streamRequestHeaders } from "./stream-request-headers.js";
import { toApiError } from "./to-api-error.js";
import { toStreamError } from "./to-stream-error.js";
import type { NotificationStreamHandlers, StreamAttempt } from "./types.js";

export const openNotificationStream = async (
  transport: typeof fetch,
  baseUrl: string,
  lastId: string | undefined,
  handlers: NotificationStreamHandlers,
  signal: AbortSignal,
): Promise<StreamAttempt> => {
  const progress: { lastId: string | undefined; receivedFrame: boolean } = {
    lastId,
    receivedFrame: false,
  };
  try {
    const response = await transport(`${baseUrl}${accountRoutes.notificationsStream}`, {
      method: "GET",
      headers: streamRequestHeaders(lastId),
      signal,
    });
    if (response.status === 401) {
      return { outcome: "unauthorized", ...progress, error: await toApiError(response) };
    }
    if (!response.ok) {
      return { outcome: "ended", ...progress, error: await toApiError(response) };
    }
    if (response.body === null) {
      return { outcome: "ended", ...progress, error: new Error(MISSING_STREAM_BODY_MESSAGE) };
    }
    await readStreamFrames(response.body, signal, (frame) => {
      progress.receivedFrame = true;
      progress.lastId = handleStreamFrame(frame, progress.lastId, handlers);
    });
    return { outcome: signal.aborted ? "aborted" : "ended", ...progress, error: undefined };
  } catch (error) {
    if (signal.aborted) {
      return { outcome: "aborted", ...progress, error: undefined };
    }
    return { outcome: "ended", ...progress, error: toStreamError(error) };
  }
};
