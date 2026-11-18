// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { readUpdateStatus } from "../apply/read-update-status.js";
import type { UpdaterServices } from "../types.js";

export const registerGetStatus = (app: FastifyInstance, services: UpdaterServices): void => {
  app.get("/status", async (_request, reply) => {
    try {
      const update = await readUpdateStatus(services.statusFile);
      return reply.code(200).send({ update });
    } catch {
      services.logger.error("update status file could not be read");
      return reply.code(500).send({ error: "status_unreadable" });
    }
  });
};
