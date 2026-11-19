// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes } from "@offgrid/contracts";
import { matchesBearerToken, sendError } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { readNightlyForUpdater } from "../../application/update/read-nightly-for-updater.js";
import { UPDATE_ERROR_RESPONSES } from "../../constants.js";
import type { SystemUpdateRouteContext } from "../../types.js";

export const registerGetUpdaterNightly = (
  api: FastifyInstance,
  context: SystemUpdateRouteContext,
): void => {
  api.get(systemRoutes.updaterNightly, async (request, reply) => {
    const { updaterToken, db } = context.deps;
    if (updaterToken === null) {
      const response = UPDATE_ERROR_RESPONSES.UPDATER_UNAVAILABLE;
      return sendError(reply, response.status, "UPDATER_UNAVAILABLE", response.message);
    }
    if (!matchesBearerToken(updaterToken, request.headers.authorization)) {
      return reply
        .code(401)
        .header("www-authenticate", "Bearer")
        .send({ code: "UNAUTHENTICATED", message: "The updater token is missing or wrong" });
    }
    return reply.code(200).send(await readNightlyForUpdater(db));
  });
};
