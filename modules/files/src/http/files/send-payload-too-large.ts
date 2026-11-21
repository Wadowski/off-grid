// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { PAYLOAD_TOO_LARGE_MESSAGE } from "../../constants.js";

export const sendPayloadTooLarge = (reply: FastifyReply) => {
  reply.header("connection", "close");
  return sendError(reply, 413, "PAYLOAD_TOO_LARGE", PAYLOAD_TOO_LARGE_MESSAGE);
};
