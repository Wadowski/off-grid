// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  ListedNotification,
  NoticeSubscriber,
  SubscriberPushResult,
  SubscriberQueue,
} from "../../types.js";

export const createSubscriberQueue = (
  subscriber: NoticeSubscriber,
  limit: number,
  onSendFailure: (error: unknown) => void,
): SubscriberQueue => {
  const pending: ListedNotification[] = [];
  let draining = false;
  let stopped = false;

  const sendFirstPending = async (): Promise<boolean> => {
    const notice = pending[0];
    if (notice === undefined) {
      return false;
    }
    try {
      await subscriber.send(notice);
      return true;
    } catch (error: unknown) {
      if (!stopped) {
        onSendFailure(error);
      }
      return false;
    }
  };

  const drain = async (): Promise<void> => {
    while (!stopped && pending.length > 0) {
      const delivered = await sendFirstPending();
      if (!delivered) {
        break;
      }
      pending.shift();
    }
    draining = false;
  };

  const push = (notice: ListedNotification): SubscriberPushResult => {
    if (stopped) {
      return "stopped";
    }
    if (pending.length >= limit) {
      return "overflow";
    }
    pending.push(notice);
    if (!draining) {
      draining = true;
      void drain();
    }
    return "queued";
  };

  const stop = (): void => {
    stopped = true;
    pending.length = 0;
  };

  return { push, stop };
};
