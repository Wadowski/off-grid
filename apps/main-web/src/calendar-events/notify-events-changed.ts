// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { eventsChangedListeners } from "./events-changed-listeners.js";

export const notifyEventsChanged = (): void => {
  for (const listener of eventsChangedListeners) {
    listener();
  }
};
