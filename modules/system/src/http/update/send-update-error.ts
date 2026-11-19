// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendAccessDenied, sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { UPDATE_ERROR_RESPONSES } from "../../constants.js";
import { updateErrorCodeOf } from "./update-error-code-of.js";

export const sendUpdateError = (reply: FastifyReply, error: unknown): FastifyReply => {
  const code = updateErrorCodeOf(error);
  if (code === null) {
    throw error;
  }
  if (code === "ACCESS_DENIED") {
    return sendAccessDenied(reply);
  }
  const response = UPDATE_ERROR_RESPONSES[code];
  return sendError(reply, response.status, code, response.message);
};
