// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";

export const sendInvitationRateLimited = (reply: FastifyReply) =>
  sendError(reply, 429, "RATE_LIMITED", "Too many attempts. Try again later");
