// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import { UNMATCHED_ROUTE } from "./constants.js";

export const routeOf = (request: FastifyRequest): string => {
  return request.routeOptions.url ?? UNMATCHED_ROUTE;
};
