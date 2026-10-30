// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, ModuleContext } from "./types.js";

export const moduleContextFor = (runtime: ServerRuntime, moduleName: string): ModuleContext => {
  return {
    eventBus: runtime.eventBus,
    logger: runtime.logger.child({ module: moduleName }),
    pool: runtime.pool,
    currentUserId: (request) => request.requestContext.userId,
  };
};
