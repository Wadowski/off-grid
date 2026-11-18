// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { uuidSchema } from "@offgrid/contracts";
import { z } from "zod";
import type { NotificationCursor } from "../../types.js";
import { InvalidNotificationCursorError } from "../errors/invalid-notification-cursor-error.js";
import { parseCursorJson } from "./parse-cursor-json.js";

const cursorPayloadSchema = z.object({
  c: z.iso.datetime(),
  i: uuidSchema,
});

export const decodeNotificationCursor = (value: string): NotificationCursor => {
  const payload = cursorPayloadSchema.safeParse(parseCursorJson(value));
  if (!payload.success) {
    throw new InvalidNotificationCursorError();
  }
  return {
    createdAt: new Date(payload.data.c),
    notificationId: payload.data.i,
  };
};
