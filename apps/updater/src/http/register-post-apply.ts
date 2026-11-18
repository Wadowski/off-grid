// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { runInBackground } from "../run/run-in-background.js";
import type { UpdaterServices } from "../types.js";
import { applyBodySchema } from "./apply-body-schema.js";
import { loadReleaseContext } from "./load-release-context.js";

export const registerPostApply = (app: FastifyInstance, services: UpdaterServices): void => {
  app.post("/apply", async (request, reply) => {
    const body = applyBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const release = services.runLock.tryAcquire();
    if (release === null) {
      return reply.code(409).send({ error: "update_already_running" });
    }
    const targetVersion = body.data.version;
    const context = await loadReleaseContext(services, targetVersion);
    if (!context.ok) {
      release();
      return reply.code(context.statusCode).send({ error: context.error });
    }
    runInBackground(services.logger, release, () =>
      services.runApply({ currentVersion: context.currentVersion, manifest: context.manifest }),
    );
    return reply.code(202).send({ started: true, targetVersion });
  });
};
