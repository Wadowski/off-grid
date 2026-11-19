// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { SystemUpdateRouteContext, SystemVersionOptions } from "../types.js";
import { registerGetSystemVersion } from "./register-get-system-version.js";
import { registerSystemUpdateRoutes } from "./update/register-system-update-routes.js";

export const registerSystemRoutes = (
  api: FastifyInstance,
  options: SystemVersionOptions,
  updateContext: SystemUpdateRouteContext,
): void => {
  registerGetSystemVersion(api, options);
  registerSystemUpdateRoutes(api, updateContext);
};
