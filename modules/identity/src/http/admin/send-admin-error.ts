// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendAccessDenied, sendError, sendNotFound, sendValidationFailed } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { AccountNotFoundError } from "../../application/errors/account-not-found-error.js";
import { AdminRequiredError } from "../../application/errors/admin-required-error.js";
import { LastAdminError } from "../../application/errors/last-admin-error.js";

export const sendAdminError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof z.ZodError) {
    return sendValidationFailed(reply, error);
  }
  if (error instanceof AdminRequiredError) {
    return sendAccessDenied(reply);
  }
  if (error instanceof LastAdminError) {
    return sendError(reply, 409, "LAST_ADMIN", "The last active admin cannot be disabled");
  }
  if (error instanceof AccountNotFoundError) {
    return sendNotFound(reply);
  }
  throw error;
};
