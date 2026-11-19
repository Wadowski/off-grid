// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REALTIME_WORKER_NAME } from "../../constants.js";
import type { NotificationHub, NotificationsWorker } from "../../types.js";

export const createRealtimeWorker = (hub: NotificationHub): NotificationsWorker => ({
  name: REALTIME_WORKER_NAME,
  start: async () => undefined,
  stop: async () => hub.close(),
});
