// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { registerEndOtherSessions } from "./register-end-other-sessions.js";
import { registerEndSession } from "./register-end-session.js";
import { registerListSessions } from "./register-list-sessions.js";

export const registerSessions = (api: FastifyInstance, context: IdentityRouteContext): void => {
  registerListSessions(api, context);
  registerEndSession(api, context);
  registerEndOtherSessions(api, context);
};
