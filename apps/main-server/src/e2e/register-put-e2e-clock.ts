// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ControlledClock } from "./controlled-clock.js";

const EARLIEST_INSTANT = Date.parse("2000-01-01T00:00:00Z");
const LATEST_INSTANT = Date.parse("2100-01-01T00:00:00Z");

const freezeBodySchema = z.strictObject({
  now: z.iso.datetime({ offset: true }).refine((value) => {
    const instant = Date.parse(value);
    return instant >= EARLIEST_INSTANT && instant < LATEST_INSTANT;
  }, "instant must fall between 2000 and 2100"),
});

export const registerPutE2eClock = (api: FastifyInstance, control: ControlledClock): void => {
  api.put("/e2e/clock", async (request, reply) => {
    const body = freezeBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "invalid clock instant" });
    }
    await control.freezeAndAwaitPolls(new Date(body.data.now));
    return reply.code(204).send();
  });
};
