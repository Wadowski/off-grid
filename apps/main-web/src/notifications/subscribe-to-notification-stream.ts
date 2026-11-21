// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { subscribeNotifications, type SubscribeNotificationsOptions } from "@offgrid/api-client";
import { API_PATH } from "../constants.js";
import { serverOrigin } from "../api/server-origin.js";
import { sendWithSession } from "../session/send-with-session.js";

export const subscribeToNotificationStream = (
  options: Pick<SubscribeNotificationsOptions, "signal" | "onNotification" | "onReset" | "onError">,
): Promise<void> =>
  subscribeNotifications({
    ...options,
    baseUrl: `${serverOrigin()}${API_PATH}`,
    fetch: sendWithSession,
  });
