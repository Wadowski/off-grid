// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { fetchReleaseManifest } from "../release/fetch-release-manifest.js";
import { runInBackground } from "../run/run-in-background.js";
import type { UpdaterServices } from "../types.js";
import { applyBodySchema } from "./apply-body-schema.js";

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
    const currentVersion = await services.currentVersion().catch(() => null);
    if (currentVersion === null) {
      release();
      return reply.code(503).send({ error: "current_version_unknown" });
    }
    const manifest = await fetchReleaseManifest(
      services.httpFetch,
      services.releaseRepository,
      targetVersion,
    ).catch(() => null);
    if (manifest === null) {
      release();
      return reply.code(502).send({ error: "release_source_unreachable" });
    }
    runInBackground(services.logger, release, () =>
      services.runApply({ currentVersion, manifest }),
    );
    return reply.code(202).send({ started: true, targetVersion });
  });
};
