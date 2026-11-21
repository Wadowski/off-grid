// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useOpenEventRoute } from "../calendar-events/use-open-event-route.js";
import type { NotificationItem } from "./inbox-store/types.js";

export const useOpenNotice = (
  markRead: (notificationId: string) => Promise<void>,
): ((notice: NotificationItem) => Promise<void>) => {
  const openEvent = useOpenEventRoute();
  return useCallback(
    async (notice: NotificationItem) => {
      await markRead(notice.id);
      const eventId = notice.data.eventId;
      if (eventId !== undefined) {
        openEvent(eventId);
      }
    },
    [markRead, openEvent],
  );
};
