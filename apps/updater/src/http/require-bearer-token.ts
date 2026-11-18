// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply, FastifyRequest } from "fastify";
import { parseBearerToken } from "./parse-bearer-token.js";
import { tokenMatches } from "./token-matches.js";

export const requireBearerToken = async (
  expectedToken: string,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const presentedToken = parseBearerToken(request.headers.authorization);
  if (presentedToken !== null && tokenMatches(expectedToken, presentedToken)) {
    return;
  }
  await reply.code(401).header("www-authenticate", "Bearer").send({ error: "unauthorized" });
};
