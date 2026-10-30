// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply } from "fastify";
import type { z } from "zod";
import { sendError } from "./send-error.js";
import { validationMessage } from "./validation-message.js";

export const sendValidationFailed = (reply: FastifyReply, error: z.ZodError) =>
  sendError(reply, 400, "VALIDATION_FAILED", validationMessage(error));
