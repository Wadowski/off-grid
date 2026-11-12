// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { listCalendars } from "./calendar-api.js";
import type { Calendar, CalendarsState } from "./types.js";

export const useCalendars = (enabled: boolean): CalendarsState => {
  const [calendars, setCalendars] = useState<readonly Calendar[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const latestListRequest = useRef(0);

  const loadCalendars = useCallback(async () => {
    const request = ++latestListRequest.current;
    const isLatest = () => request === latestListRequest.current;
    setListStatus("loading");
    try {
      const list = await listCalendars();
      if (isLatest()) {
        setCalendars(list);
        setListStatus("ready");
      }
    } catch {
      if (isLatest()) {
        setListStatus("failed");
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void loadCalendars();
    }
  }, [enabled, loadCalendars]);

  return { calendars, listStatus, refreshCalendars: loadCalendars };
};
