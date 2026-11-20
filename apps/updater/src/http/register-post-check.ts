// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { checkForUpdate } from "../release/check-for-update.js";
import type { UpdaterServices } from "../types.js";
import { loadReleaseContext } from "../release/load-release-context.js";

export const registerPostCheck = (app: FastifyInstance, services: UpdaterServices): void => {
  app.post("/check", async (_request, reply) => {
    const context = await loadReleaseContext(services, null);
    if (!context.ok) {
      return reply.code(context.statusCode).send({ error: context.error });
    }
    return reply.code(200).send(checkForUpdate(context.currentVersion, context.manifest));
  });
};
