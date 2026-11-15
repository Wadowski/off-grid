// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { eventsChangedListeners } from "./events-changed-listeners.js";
import type { EventsChangedListener } from "./types.js";

export const subscribeEventsChanged = (listener: EventsChangedListener): (() => void) => {
  eventsChangedListeners.add(listener);
  return () => {
    eventsChangedListeners.delete(listener);
  };
};
