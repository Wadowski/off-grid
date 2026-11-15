// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { webCalendarClient } from "../../api/web-api-client.js";
import type { EventGuestRow, EventGuestsState, LoadStatus } from "./types.js";

export const useEventGuests = (eventId: string | undefined): EventGuestsState => {
  const [guests, setGuests] = useState<readonly EventGuestRow[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (eventId === undefined) {
      return undefined;
    }
    let current = true;
    setStatus("loading");
    webCalendarClient
      .listEventGuests(eventId)
      .then((rows) => {
        if (current) {
          setGuests(rows);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (current) {
          setStatus("failed");
        }
      });
    return () => {
      current = false;
    };
  }, [eventId, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  if (eventId === undefined) {
    return { status: "ready", guests: [], retry };
  }
  return { status, guests, retry };
};
