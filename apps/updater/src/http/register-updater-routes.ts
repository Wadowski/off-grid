// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { UpdaterServices } from "../types.js";
import { registerGetStatus } from "./register-get-status.js";
import { registerPostApply } from "./register-post-apply.js";
import { registerPostCheck } from "./register-post-check.js";

export const registerUpdaterRoutes = (app: FastifyInstance, services: UpdaterServices): void => {
  registerGetStatus(app, services);
  registerPostCheck(app, services);
  registerPostApply(app, services);
};
