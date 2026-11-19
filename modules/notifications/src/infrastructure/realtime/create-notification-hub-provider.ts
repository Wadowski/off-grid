// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { NotificationHub } from "../../types.js";
import { createNotificationHub } from "./create-notification-hub.js";

export const createNotificationHubProvider = (
  queueLimit: number,
  maxStreamsPerUser: number,
): ((logger: Logger) => NotificationHub) => {
  let hub: NotificationHub | undefined;
  return (logger: Logger): NotificationHub => {
    hub ??= createNotificationHub(logger, queueLimit, maxStreamsPerUser);
    return hub;
  };
};
