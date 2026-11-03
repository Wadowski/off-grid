// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionStore } from "./session-store.js";

export const subscribeToSession = (listener: () => void): (() => void) => {
  sessionStore.listeners.add(listener);
  return () => {
    sessionStore.listeners.delete(listener);
  };
};
