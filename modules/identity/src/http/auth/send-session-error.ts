// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { InvalidCredentialsError } from "../../application/errors/invalid-credentials-error.js";
import { SessionEndedError } from "../../application/errors/session-ended-error.js";

export const sendSessionError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
  }
  if (error instanceof InvalidCredentialsError) {
    return sendError(reply, 401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  if (error instanceof SessionEndedError) {
    return sendError(reply, 401, "SESSION_ENDED", "Please sign in again");
  }
  throw error;
};
