// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SESSION_CHANNEL_NAME } from "../constants.js";

// Tabs share the refresh cookie, so a sign-in or sign-out in one tab is announced
// to the others, which then renew or end their own session in memory.
export type SessionMessage = { readonly type: "signed-in" } | { readonly type: "signed-out" };

let channel: BroadcastChannel | null = null;

const sessionChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }
  channel ??= new BroadcastChannel(SESSION_CHANNEL_NAME);
  return channel;
};

export const announceSessionMessage = (message: SessionMessage): void => {
  sessionChannel()?.postMessage(message);
};

// A BroadcastChannel never delivers to the object that posted, so a tab only hears the others.
export const listenForSessionMessages = (
  onMessage: (message: SessionMessage) => void,
): (() => void) => {
  const listened = sessionChannel();
  if (listened === null) {
    return () => undefined;
  }
  listened.onmessage = (event: MessageEvent<SessionMessage>) => {
    onMessage(event.data);
  };
  return () => {
    listened.onmessage = null;
  };
};
