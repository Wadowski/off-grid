// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import type { NoticeSubscriber, NotificationStream, ReplayBuffer } from "../../types.js";
import { readMissedOrReset } from "./read-missed-or-reset.js";
import { writeStreamReset } from "./write-stream-reset.js";

export const replayMissedNotices = async (
  stream: NotificationStream,
  lastNoticeId: string,
  response: ServerResponse,
  buffer: ReplayBuffer,
  subscriber: NoticeSubscriber,
): Promise<void> => {
  const missed = await readMissedOrReset(stream, lastNoticeId);
  if (missed.kind === "reset") {
    writeStreamReset(response);
    await buffer.flush(new Set(), subscriber);
    return;
  }
  for (const notice of missed.notices) {
    await subscriber.send(notice);
  }
  await buffer.flush(new Set(missed.notices.map((notice) => notice.id)), subscriber);
};
