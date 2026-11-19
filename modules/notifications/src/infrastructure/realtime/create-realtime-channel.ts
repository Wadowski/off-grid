// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toRealtimePayload } from "../../application/channels/to-realtime-payload.js";
import { REALTIME_CHANNEL_NAME } from "../../constants.js";
import type { NotificationChannel, NotificationHub } from "../../types.js";

export const createRealtimeChannel = (hub: NotificationHub): NotificationChannel => ({
  name: REALTIME_CHANNEL_NAME,
  deliver: async (notice) => {
    hub.publish(notice.userId, toRealtimePayload(notice));
  },
});
