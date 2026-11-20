// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import type { Logger } from "@offgrid/observability";
import { errorTypeName } from "../../infrastructure/realtime/error-type-name.js";
import type { SessionVerifier, StreamSessionState } from "../../types.js";

export const checkStreamSession = async (
  verifySession: SessionVerifier,
  request: FastifyRequest,
  userId: string,
  logger: Logger,
): Promise<StreamSessionState> => {
  try {
    const session = await verifySession(request);
    return session === null || session.userId !== userId ? "ended" : "active";
  } catch (error: unknown) {
    logger.warn("notification stream session check failed", { error: errorTypeName(error) });
    return "unknown";
  }
};
