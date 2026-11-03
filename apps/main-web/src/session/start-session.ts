// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { establishSession } from "./establish-session.js";
import { sessionRuntime } from "./session-runtime.js";

export const startSession = (): Promise<void> => {
  sessionRuntime.started ??= establishSession();
  return sessionRuntime.started;
};
