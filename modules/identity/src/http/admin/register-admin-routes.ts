// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { registerAdminInstanceSettings } from "./register-admin-instance-settings.js";
import { registerListUsers } from "./register-list-users.js";
import { registerSetUserDisabled } from "./register-set-user-disabled.js";
import { registerStartPasswordReset } from "./register-start-password-reset.js";

export const registerAdminRoutes = (api: FastifyInstance, context: IdentityRouteContext): void => {
  registerListUsers(api, context);
  registerSetUserDisabled(api, context);
  registerStartPasswordReset(api, context);
  registerAdminInstanceSettings(api, context);
};
