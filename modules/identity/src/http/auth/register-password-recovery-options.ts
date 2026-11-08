// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { getPasswordRecoveryOptions } from "../../application/password-recovery/get-password-recovery-options.js";
import { PASSWORD_RECOVERY_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import type { IdentityRouteContext } from "../../types.js";

export const registerPasswordRecoveryOptions = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get(
    authRoutes.passwordRecoveryOptions,
    {
      config: {
        rateLimit: { max: PASSWORD_RECOVERY_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async () => getPasswordRecoveryOptions(context.db),
  );
};
