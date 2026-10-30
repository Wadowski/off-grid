// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply } from "fastify";
import { sendError } from "./send-error.js";

export const sendAccessDenied = (reply: FastifyReply) =>
  sendError(reply, 403, "ACCESS_DENIED", "You do not have access to this resource");
