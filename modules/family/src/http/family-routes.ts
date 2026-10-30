// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { registerCreateFamily } from "./register-create-family.js";
import { registerGetFamily } from "./register-get-family.js";
import { registerListFamilies } from "./register-list-families.js";
import type { FamilyRouteContext } from "../types.js";

export const registerFamilyRoutes = (api: FastifyInstance, context: FamilyRouteContext): void => {
  registerCreateFamily(api, context);
  registerListFamilies(api, context);
  registerGetFamily(api, context);
};
