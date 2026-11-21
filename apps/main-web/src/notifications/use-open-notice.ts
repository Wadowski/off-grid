// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eventDetailsTarget } from "../calendar-events/event-details-route.js";
import type { NotificationItem } from "./inbox-store/types.js";

export const useOpenNotice = (
  markRead: (notificationId: string) => Promise<void>,
): ((notice: NotificationItem) => Promise<void>) => {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    async (notice: NotificationItem) => {
      await markRead(notice.id);
      const eventId = notice.data.eventId;
      if (eventId === undefined) {
        return;
      }
      const target = eventDetailsTarget(location, eventId);
      navigate(target.to, { state: target.state });
    },
    [location, markRead, navigate],
  );
};
