// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError, sendNotFound, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { CurrentPasswordIncorrectError } from "../../application/errors/current-password-incorrect-error.js";
import { PasswordIncorrectError } from "../../application/errors/password-incorrect-error.js";
import { PasswordRejectedError } from "../../application/errors/password-rejected-error.js";
import { SessionNotFoundError } from "../../application/errors/session-not-found-error.js";

export const sendAccountError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
  }
  if (error instanceof CurrentPasswordIncorrectError) {
    return sendError(reply, 403, "CURRENT_PASSWORD_INCORRECT", "The current password is incorrect");
  }
  if (error instanceof PasswordIncorrectError) {
    return sendError(reply, 403, "PASSWORD_INCORRECT", "The password is incorrect");
  }
  if (error instanceof PasswordRejectedError) {
    const [firstProblem] = error.problems;
    return sendError(
      reply,
      400,
      firstProblem ?? "PASSWORD_REJECTED",
      "Password does not meet the rules",
    );
  }
  if (error instanceof SessionNotFoundError) {
    return sendNotFound(reply);
  }
  throw error;
};
