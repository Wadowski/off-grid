// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { getPasswordRecoveryOptions } from "../../application/password-recovery/get-password-recovery-options.js";
import type { IdentityRouteContext } from "../../types.js";

export const registerPasswordRecoveryOptions = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get(authRoutes.passwordRecoveryOptions, async () => getPasswordRecoveryOptions(context.db));
};
