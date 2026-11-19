// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import type { FastifyReply } from "fastify";

export const copyReplyHeaders = (reply: FastifyReply, response: ServerResponse): void => {
  for (const [name, value] of Object.entries(reply.getHeaders())) {
    if (value !== undefined) {
      response.setHeader(name, value);
    }
  }
};
