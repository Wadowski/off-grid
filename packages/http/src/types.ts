// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";

export type CurrentUserId = (request: FastifyRequest) => string | null;
