// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { InvalidNotificationCursorError } from "../application/errors/invalid-notification-cursor-error.js";

export const sendNotificationCursorError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof InvalidNotificationCursorError) {
    return sendError(reply, 400, "VALIDATION_FAILED", "cursor is invalid");
  }
  throw error;
};
