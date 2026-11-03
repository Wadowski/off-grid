// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionStore } from "./session-store.js";
import type { SessionState } from "./types.js";

export const setSessionState = (next: SessionState): void => {
  sessionStore.current = next;
  for (const listener of sessionStore.listeners) {
    listener();
  }
};
