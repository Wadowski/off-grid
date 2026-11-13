// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { webCalendarClient } from "../api/web-api-client.js";
import type { ListStatus } from "../types.js";
import { UTC_TIME_ZONE } from "./time-format.js";

export type CalendarTimeZoneState = {
  readonly status: ListStatus;
  readonly timeZone: string;
};

export const useCalendarTimeZone = (enabled: boolean): CalendarTimeZoneState => {
  const [timeZone, setTimeZone] = useState(UTC_TIME_ZONE);
  const [status, setStatus] = useState<ListStatus>("loading");

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    setStatus("loading");
    webCalendarClient
      .getTimeZone()
      .then((response) => {
        if (!cancelled) {
          setTimeZone(response.isSet ? response.timeZone : UTC_TIME_ZONE);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTimeZone(UTC_TIME_ZONE);
          setStatus("failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { status, timeZone };
};
