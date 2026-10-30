// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply } from "fastify";
import { sendError } from "./send-error.js";

export const sendNotFound = (reply: FastifyReply) =>
  sendError(reply, 404, "NOT_FOUND", "The requested resource was not found");
