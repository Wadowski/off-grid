// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { ControlledClock } from "./controlled-clock.js";

export const registerDeleteE2eClock = (api: FastifyInstance, control: ControlledClock): void => {
  api.delete("/e2e/clock", async (_request, reply) => {
    control.release();
    return reply.code(204).send();
  });
};
