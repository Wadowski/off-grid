// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { SystemVersionOptions } from "../types.js";
import { registerGetSystemVersion } from "./register-get-system-version.js";

export const registerSystemRoutes = (api: FastifyInstance, options: SystemVersionOptions): void => {
  registerGetSystemVersion(api, options);
};
