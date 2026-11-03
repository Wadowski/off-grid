// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { establishSession } from "./establish-session.js";
import { startState } from "./start-state.js";

export const startSession = (): Promise<void> => {
  startState.started ??= establishSession();
  return startState.started;
};
