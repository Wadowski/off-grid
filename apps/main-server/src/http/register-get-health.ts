// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";

export const registerGetHealth = (api: FastifyInstance): void => {
  api.get("/health", async () => ({ status: "ok" }));
};
