// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { EmailTakenError } from "../application/email-taken-error.js";
import { FirstAdminClaimedError } from "../application/first-admin-claimed-error.js";
import { PasswordRejectedError } from "../application/password-rejected-error.js";
import { RegistrationClosedError } from "../application/registration-closed-error.js";

export const sendRegistrationError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
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
  if (error instanceof EmailTakenError) {
    return sendError(reply, 409, "EMAIL_TAKEN", "An account with this email already exists");
  }
  if (error instanceof FirstAdminClaimedError) {
    return sendError(reply, 409, "REGISTRATION_CONFLICT", "Please try again");
  }
  if (error instanceof RegistrationClosedError) {
    return sendError(reply, 403, "REGISTRATION_CLOSED", "Registration closed on this instance");
  }
  throw error;
};
