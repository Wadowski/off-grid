// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { registerDisableUser } from "./register-disable-user.js";
import { registerEnableUser } from "./register-enable-user.js";

export const registerSetUserDisabled = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  registerDisableUser(api, context);
  registerEnableUser(api, context);
};
