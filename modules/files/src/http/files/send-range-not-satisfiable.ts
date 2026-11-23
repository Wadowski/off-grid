// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { RANGE_NOT_SATISFIABLE_MESSAGE } from "../../constants.js";

export const sendRangeNotSatisfiable = (reply: FastifyReply, sizeBytes: number) => {
  reply.header("accept-ranges", "bytes");
  reply.header("content-range", `bytes */${sizeBytes}`);
  return sendError(reply, 416, "RANGE_NOT_SATISFIABLE", RANGE_NOT_SATISFIABLE_MESSAGE);
};
