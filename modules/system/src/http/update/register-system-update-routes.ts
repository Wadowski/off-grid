// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { SystemUpdateRouteContext } from "../../types.js";
import { registerGetSystemUpdate } from "./register-get-system-update.js";
import { registerPostSystemUpdateApply } from "./register-post-system-update-apply.js";
import { registerPostSystemUpdateCheck } from "./register-post-system-update-check.js";
import { registerPutSystemUpdateNightly } from "./register-put-system-update-nightly.js";

export const registerSystemUpdateRoutes = (
  api: FastifyInstance,
  context: SystemUpdateRouteContext,
): void => {
  registerGetSystemUpdate(api, context);
  registerPostSystemUpdateCheck(api, context);
  registerPostSystemUpdateApply(api, context);
  registerPutSystemUpdateNightly(api, context);
};
