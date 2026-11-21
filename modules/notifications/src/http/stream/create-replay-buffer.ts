// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListedNotification, NoticeSubscriber, ReplayBuffer } from "../../types.js";

export const createReplayBuffer = (capacity: number, end: () => void): ReplayBuffer => {
  const pending: ListedNotification[] = [];
  let delivered: ReadonlySet<string> = new Set<string>();
  let forward: NoticeSubscriber | null = null;

  const subscriber: NoticeSubscriber = {
    send: async (notice: ListedNotification): Promise<void> => {
      if (delivered.has(notice.id)) {
        return;
      }
      if (forward !== null) {
        return forward.send(notice);
      }
      if (pending.length >= capacity) {
        end();
        return;
      }
      pending.push(notice);
    },
    close: end,
  };

  const flush = async (
    replayedIds: ReadonlySet<string>,
    target: NoticeSubscriber,
  ): Promise<void> => {
    const sent = new Set<string>(replayedIds);
    delivered = sent;
    while (pending.length > 0) {
      const notice = pending.shift();
      if (notice !== undefined && !sent.has(notice.id)) {
        sent.add(notice.id);
        await target.send(notice);
      }
    }
    forward = target;
  };

  return { subscriber, flush };
};
