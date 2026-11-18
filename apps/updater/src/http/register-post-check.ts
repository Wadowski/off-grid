// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { fetchReleaseManifest } from "../release/fetch-release-manifest.js";
import { checkForUpdate } from "../release/check-for-update.js";
import type { UpdaterServices } from "../types.js";

export const registerPostCheck = (app: FastifyInstance, services: UpdaterServices): void => {
  app.post("/check", async (_request, reply) => {
    const currentVersion = await services.currentVersion().catch(() => null);
    if (currentVersion === null) {
      return reply.code(503).send({ error: "current_version_unknown" });
    }
    const manifest = await fetchReleaseManifest(
      services.httpFetch,
      services.releaseRepository,
      null,
    ).catch(() => null);
    if (manifest === null) {
      return reply.code(502).send({ error: "release_source_unreachable" });
    }
    return reply.code(200).send(checkForUpdate(currentVersion, manifest));
  });
};
