// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { createUpdaterClient } from "./infrastructure/updater/create-updater-client.js";
import { SYSTEM_MODULE_NAME } from "./constants.js";
import { registerSystemRoutes } from "./http/register-system-routes.js";
import type { SystemModuleContext, SystemModuleOptions } from "./types.js";

export const createSystemModule = (options: SystemModuleOptions) => {
  const updater = createUpdaterClient(options.updater);
  return {
    name: SYSTEM_MODULE_NAME,
    registerRoutes: (api: FastifyInstance, context: SystemModuleContext): void => {
      registerSystemRoutes(api, options, {
        currentUserId: context.currentUserId,
        deps: {
          db: context.db,
          updater,
          updaterToken: options.updater?.token ?? null,
          isInstanceAdmin: context.isInstanceAdmin,
          currentVersion: options.version,
        },
      });
    },
  };
};
