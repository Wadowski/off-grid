// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../types.js";
import { registerAdminRoutes } from "./admin/register-admin-routes.js";
import { registerChangePassword } from "./account/register-change-password.js";
import { registerRecoveryCode } from "./account/register-recovery-code.js";
import { registerSessions } from "./account/register-sessions.js";
import { registerUpdateProfile } from "./account/register-update-profile.js";
import { registerPasswordReset } from "./auth/register-password-reset.js";
import { registerCreateAccount } from "./auth/register-create-account.js";
import { registerRefreshSession } from "./auth/register-refresh-session.js";
import { registerRegistrationStatus } from "./auth/register-registration-status.js";
import { registerSignIn } from "./auth/register-sign-in.js";
import { registerSignOut } from "./auth/register-sign-out.js";

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
  registerUpdateProfile(api, context);
  registerChangePassword(api, context);
  registerRecoveryCode(api, context);
  registerSessions(api, context);
  registerAdminRoutes(api, context);
};
