// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const FAMILY_HEADER = "x-offgrid-family-id";

export const CLIENT_REQUEST_HEADERS: Readonly<Record<string, string>> = {
  "x-offgrid-request": "1",
};

export const STREAM_BACKOFF_INITIAL_MS = 1000;

export const STREAM_BACKOFF_MAX_MS = 30000;

export const STREAM_PENDING_LIMIT_CHARS = 1024 * 1024;

export const LAST_EVENT_ID_HEADER = "last-event-id";

export const NOTIFICATION_EVENT_NAME = "notification";

export const RESET_COMMENT = "reset";

export const EMPTY_SSE_FRAME = {
  event: undefined,
  id: undefined,
  data: undefined,
  comments: [],
} as const;

export const INVALID_FRAME_MESSAGE = "Invalid notification frame.";

export const MISSING_STREAM_BODY_MESSAGE = "Notification stream has no body.";

export const STREAM_LINE_LIMIT_MESSAGE = "Notification stream exceeded the buffer limit.";
