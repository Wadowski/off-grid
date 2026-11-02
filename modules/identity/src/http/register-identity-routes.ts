// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../types.js";
import { registerCreateAccount } from "./register-create-account.js";
import { registerRegistrationStatus } from "./register-registration-status.js";

export const registerIdentityRoutes = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  registerCreateAccount(api, context);
  registerRegistrationStatus(api, context);
};
