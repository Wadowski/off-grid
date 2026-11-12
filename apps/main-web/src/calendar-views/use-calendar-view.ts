// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind, calendarViewSchema } from "@offgrid/contracts";
import { useCallback, useEffect, useRef, useState } from "react";
import { webCalendarClient } from "../api/web-api-client.js";
import type { ListStatus } from "../types.js";
import { requestDateFor } from "./view-navigation.js";

export type CalendarViewResponse = ReturnType<typeof calendarViewSchema.parse>;
export type CalendarViewDay = CalendarViewResponse["days"][number];

export type CalendarViewState = {
  readonly status: ListStatus;
  readonly days: readonly CalendarViewDay[];
  readonly retry: () => void;
};

export const useCalendarView = (view: CalendarViewKind, date: string): CalendarViewState => {
  const [days, setDays] = useState<readonly CalendarViewDay[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const latestRequest = useRef(0);

  useEffect(() => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setStatus("loading");
    webCalendarClient
      .getCalendarView(view, requestDateFor(view, date))
      .then((response) => {
        if (isLatest()) {
          setDays(response.days);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (isLatest()) {
          setDays([]);
          setStatus("failed");
        }
      });
  }, [view, date, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { status, days, retry };
};
