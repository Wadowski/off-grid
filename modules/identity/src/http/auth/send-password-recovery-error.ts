// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { EmailNotConfiguredError } from "../../application/errors/email-not-configured-error.js";
import { InvalidRecoveryCodeError } from "../../application/errors/invalid-recovery-code-error.js";
import { PasswordRejectedError } from "../../application/errors/password-rejected-error.js";
import { RecoveryLockedError } from "../../application/errors/recovery-locked-error.js";

export const sendPasswordRecoveryError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
  }
  if (error instanceof InvalidRecoveryCodeError) {
    return sendError(reply, 400, "INVALID_RECOVERY_CODE", "The recovery code is not valid");
  }
  if (error instanceof RecoveryLockedError) {
    return sendError(reply, 429, "RECOVERY_LOCKED", "Too many attempts. Try again later");
  }
  if (error instanceof EmailNotConfiguredError) {
    return sendError(reply, 409, "EMAIL_NOT_CONFIGURED", "Email is not set up on this server");
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
