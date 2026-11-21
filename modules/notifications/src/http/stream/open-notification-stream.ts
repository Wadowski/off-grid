// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply, FastifyRequest } from "fastify";
import { NOTIFICATION_STREAM_HEADERS, STREAM_CONNECTED_COMMENT } from "../../constants.js";
import type { NotificationStream } from "../../types.js";
import { checkStreamSession } from "./check-stream-session.js";
import { copyReplyHeaders } from "./copy-reply-headers.js";
import { createStreamLifecycle } from "./create-stream-lifecycle.js";
import { createStreamSubscriber } from "./create-stream-subscriber.js";
import { scheduleStreamExpiry } from "./schedule-stream-expiry.js";
import { startHeartbeat } from "./start-heartbeat.js";
import { subscribeWithReplay } from "./subscribe-with-replay.js";

export const openNotificationStream = (
  request: FastifyRequest,
  reply: FastifyReply,
  stream: NotificationStream,
): void => {
  reply.hijack();
  const response = reply.raw;
  copyReplyHeaders(reply, response);
  response.writeHead(200, NOTIFICATION_STREAM_HEADERS);
  response.flushHeaders();
  response.write(STREAM_CONNECTED_COMMENT);

  const { endStream, addStop } = createStreamLifecycle(response);
  response.on("close", endStream);
  addStop(
    subscribeWithReplay(stream, response, createStreamSubscriber(response, endStream), endStream),
  );
  addStop(
    startHeartbeat(
      response,
      stream.heartbeatMs,
      () => checkStreamSession(stream.verifySession, request, stream.userId, stream.logger),
      endStream,
    ),
  );
  addStop(scheduleStreamExpiry(stream.accessExpiresAt, Date.now(), endStream));
};
