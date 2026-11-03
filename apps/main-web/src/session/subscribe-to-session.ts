// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sessionRuntime } from "./session-runtime.js";

export const subscribeToSession = (listener: () => void): (() => void) => {
  sessionRuntime.listeners.add(listener);
  return () => {
    sessionRuntime.listeners.delete(listener);
  };
};
