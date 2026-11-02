// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import { verifyAccessToken } from "@offgrid/identity";
import { moduleDatabaseFor } from "./module-database-for.js";
import { BEARER_PATTERN } from "./constants.js";
import type { ServerRuntime } from "./types.js";

export const requestIdentityFromBearer = async (
  request: FastifyRequest,
  runtime: ServerRuntime,
): Promise<string | null> => {
  const match = BEARER_PATTERN.exec(request.headers.authorization ?? "");
  if (match?.[1] === undefined) {
    return null;
  }
  const verified = await verifyAccessToken(moduleDatabaseFor(runtime, "identity"), match[1]);
  return verified?.userId ?? null;
};
