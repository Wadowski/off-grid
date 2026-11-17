// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { SYSTEM_MODULE_NAME } from "./constants.js";
import { registerSystemRoutes } from "./http/register-system-routes.js";
import type { SystemVersionOptions } from "./types.js";

export const createSystemModule = (options: SystemVersionOptions) => ({
  name: SYSTEM_MODULE_NAME,
  registerRoutes: (api: FastifyInstance): void => {
    registerSystemRoutes(api, options);
  },
});
