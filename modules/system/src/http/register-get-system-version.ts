// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { readRunningVersion } from "../application/version/read-running-version.js";
import type { SystemVersionOptions } from "../types.js";

export const registerGetSystemVersion = (
  api: FastifyInstance,
  options: SystemVersionOptions,
): void => {
  api.get(systemRoutes.version, async () => readRunningVersion(options));
};
