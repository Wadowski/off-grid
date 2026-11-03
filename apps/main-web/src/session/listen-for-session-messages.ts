// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { getSessionChannel } from "./get-session-channel.js";
import type { SessionMessage } from "./types.js";

export const listenForSessionMessages = (onMessage: (message: SessionMessage) => void): void => {
  const channel = getSessionChannel();
  if (channel === null) {
    return;
  }
  channel.onmessage = (event: MessageEvent<SessionMessage>) => {
    onMessage(event.data);
  };
};
