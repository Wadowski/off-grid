// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { useCallback, useEffect, useState } from "react";
import { webCalendarClient } from "../../api/web-api-client.js";
import { subscribeEventsChanged } from "../subscribe-events-changed.js";
import type { CalendarEventDetails, CalendarEventState, CalendarEventStatus } from "./types.js";

export const useCalendarEvent = (eventId: string): CalendarEventState => {
  const [event, setEvent] = useState<CalendarEventDetails | undefined>(undefined);
  const [status, setStatus] = useState<CalendarEventStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    webCalendarClient
      .getCalendarEvent(eventId)
      .then((response) => {
        if (current) {
          setEvent(response);
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (current) {
          setEvent(undefined);
          setStatus(error instanceof ApiError && error.status === 404 ? "notFound" : "failed");
        }
      });
    return () => {
      current = false;
    };
  }, [eventId, attempt]);

  useEffect(() => subscribeEventsChanged(() => setAttempt((count) => count + 1)), []);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((count) => count + 1);
  }, []);

  return { status, event, retry };
};
