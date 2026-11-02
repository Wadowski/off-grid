// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../types.js";
import { registerAdminRoutes } from "./register-admin-routes.js";
import { registerPasswordReset } from "./register-password-reset.js";
import { registerCreateAccount } from "./register-create-account.js";
import { registerRefreshSession } from "./register-refresh-session.js";
import { registerRegistrationStatus } from "./register-registration-status.js";
import { registerSignIn } from "./register-sign-in.js";
import { registerSignOut } from "./register-sign-out.js";

export const registerIdentityRoutes = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  registerCreateAccount(api, context);
  registerRegistrationStatus(api, context);
  registerSignIn(api, context);
  registerRefreshSession(api, context);
  registerSignOut(api, context);
  registerPasswordReset(api, context);
  registerAdminRoutes(api, context);
};
