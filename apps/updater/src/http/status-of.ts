// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyError } from "fastify";

export const statusOf = (error: FastifyError): number => error.statusCode ?? 500;
