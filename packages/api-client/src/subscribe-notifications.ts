// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { reconnectDelay } from "./reconnect-delay.js";
import { openNotificationStream } from "./open-notification-stream.js";
import { waitOrAbort } from "./wait-or-abort.js";
import type { SubscribeNotificationsOptions } from "./types.js";

export const subscribeNotifications = async (
  options: SubscribeNotificationsOptions,
): Promise<void> => {
  const transport = options.fetch ?? fetch;
  const random = options.random ?? Math.random;
  let lastId: string | undefined;
  let backoffStep = 0;
  while (!options.signal.aborted) {
    const attempt = await openNotificationStream(
      transport,
      options.baseUrl,
      lastId,
      options,
      options.signal,
    );
    if (attempt.outcome === "aborted") {
      return;
    }
    if (attempt.error !== undefined && !options.signal.aborted) {
      options.onError(attempt.error);
    }
    if (attempt.outcome === "unauthorized") {
      return;
    }
    lastId = attempt.lastId;
    backoffStep = attempt.receivedFrame ? 0 : backoffStep;
    const waited = await waitOrAbort(reconnectDelay(backoffStep, random), options.signal);
    if (!waited) {
      return;
    }
    backoffStep += 1;
  }
};
