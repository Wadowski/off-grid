// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SESSION_CHANNEL_NAME } from "../constants.js";
import { sessionRuntime } from "./session-runtime.js";

export const getSessionChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }
  sessionRuntime.channel ??= new BroadcastChannel(SESSION_CHANNEL_NAME);
  return sessionRuntime.channel;
};
