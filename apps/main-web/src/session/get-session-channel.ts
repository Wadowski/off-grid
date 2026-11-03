// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SESSION_CHANNEL_NAME } from "../constants.js";
import { sessionChannelState } from "./session-channel-state.js";

export const getSessionChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }
  sessionChannelState.channel ??= new BroadcastChannel(SESSION_CHANNEL_NAME);
  return sessionChannelState.channel;
};
