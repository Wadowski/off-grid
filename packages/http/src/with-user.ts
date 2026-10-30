// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply, FastifyRequest } from "fastify";
import { sendUnauthenticated } from "./send-unauthenticated.js";
import type { CurrentUserId } from "./types.js";

export const withUser =
  (
    currentUserId: CurrentUserId,
    handle: (request: FastifyRequest, reply: FastifyReply, userId: string) => Promise<unknown>,
  ) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = currentUserId(request);
    if (userId === null) {
      return sendUnauthenticated(reply);
    }
    return handle(request, reply, userId);
  };
