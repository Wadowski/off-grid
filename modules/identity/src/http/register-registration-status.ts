// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { getRegistrationStatus } from "../application/get-registration-status.js";
import type { IdentityRouteContext } from "../types.js";

export const registerRegistrationStatus = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get("/auth/registration-status", async () => getRegistrationStatus(context.db));
};
