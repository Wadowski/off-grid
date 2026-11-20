// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { matchesBearerToken } from "@offgrid/http";
import type { FastifyReply, FastifyRequest } from "fastify";

export const requireBearerToken = async (
  expectedToken: string,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  if (matchesBearerToken(expectedToken, request.headers.authorization)) {
    return;
  }
  await reply.code(401).header("www-authenticate", "Bearer").send({ error: "unauthorized" });
};
