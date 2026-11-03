// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useSyncExternalStore } from "react";
import { getSessionState } from "./get-session-state.js";
import { subscribeToSession } from "./subscribe-to-session.js";
import type { SessionState } from "./types.js";

export const useSession = (): SessionState =>
  useSyncExternalStore(subscribeToSession, getSessionState);
