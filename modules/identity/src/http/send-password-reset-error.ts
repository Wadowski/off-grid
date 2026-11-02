// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { InvalidResetCodeError } from "../application/invalid-reset-code-error.js";
import { PasswordRejectedError } from "../application/password-rejected-error.js";

export const sendPasswordResetError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
  }
  if (error instanceof InvalidResetCodeError) {
    return sendError(reply, 400, "INVALID_RESET_CODE", "The reset code is invalid or has expired");
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
  throw error;
};
