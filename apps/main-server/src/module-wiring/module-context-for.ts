// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isActiveInstanceAdmin } from "@offgrid/identity";
import type { ServerRuntime, ModuleContext } from "../types.js";
import { moduleDatabaseFor } from "./module-database-for.js";

export const moduleContextFor = (runtime: ServerRuntime, moduleName: string): ModuleContext => {
  return {
    eventBus: runtime.eventBus,
    logger: runtime.logger.child({ module: moduleName }),
    get db() {
      return moduleDatabaseFor(runtime, moduleName);
    },
    currentUserId: (request) => request.requestContext.userId,
    currentFamilyId: (request) => request.requestContext.familyId,
    currentSessionId: (request) => request.requestContext.sessionId,
    isInstanceAdmin: (userId) =>
      isActiveInstanceAdmin(moduleDatabaseFor(runtime, "identity"), userId),
  };
};
