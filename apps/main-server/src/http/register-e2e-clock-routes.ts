// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ServerRuntime } from "../types.js";

const freezeBodySchema = z.strictObject({ now: z.iso.datetime({ offset: true }) });

// Test-only time seam. Registered only when OFFGRID_E2E_CLOCK is "on", which only the e2e
// compose override sets. It freezes the clock the reminder worker reads and writes no rows.
export const registerE2eClockRoutes = (api: FastifyInstance, runtime: ServerRuntime): void => {
  const control = runtime.clock.control;
  if (control === undefined) {
    return;
  }

  api.put("/e2e/clock", async (request, reply) => {
    const body = freezeBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "invalid clock instant" });
    }
    await control.freezeAndAwaitPolls(new Date(body.data.now));
    return reply.code(204).send();
  });

  api.delete("/e2e/clock", async (_request, reply) => {
    control.release();
    return reply.code(204).send();
  });
};
