// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";

export const sendLastAdmin = (reply: FastifyReply) =>
  sendError(reply, 409, "LAST_ADMIN", "A family must keep at least one admin");
