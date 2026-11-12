// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { registerGetAdminInstanceSettings } from "./register-get-admin-instance-settings.js";
import { registerUpdateAdminInstanceSettings } from "./register-update-admin-instance-settings.js";

export const registerAdminInstanceSettings = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  registerGetAdminInstanceSettings(api, context);
  registerUpdateAdminInstanceSettings(api, context);
};
