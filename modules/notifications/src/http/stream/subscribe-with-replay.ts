// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import { SUBSCRIBER_QUEUE_LIMIT } from "../../constants.js";
import type { NoticeSubscriber, NotificationStream, StreamStop } from "../../types.js";
import { createReplayBuffer } from "./create-replay-buffer.js";
import { readLastEventId } from "./read-last-event-id.js";
import { replayMissedNotices } from "./replay-missed-notices.js";
import { writeStreamReset } from "./write-stream-reset.js";

export const subscribeWithReplay = (
  stream: NotificationStream,
  response: ServerResponse,
  subscriber: NoticeSubscriber,
  endStream: () => void,
): StreamStop => {
  const lastEvent = readLastEventId(stream.lastEventId);
  if (lastEvent.kind === "absent") {
    return stream.hub.subscribe(stream.userId, subscriber);
  }
  if (lastEvent.kind === "invalid") {
    writeStreamReset(response);
    return stream.hub.subscribe(stream.userId, subscriber);
  }
  const buffer = createReplayBuffer(SUBSCRIBER_QUEUE_LIMIT, endStream);
  const unsubscribe = stream.hub.subscribe(stream.userId, buffer.subscriber);
  void replayMissedNotices(stream, lastEvent.id, response, buffer, subscriber).catch(endStream);
  return unsubscribe;
};
