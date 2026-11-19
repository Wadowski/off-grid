// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendNotFound } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import type { FilesOutcome } from "../../types.js";

export const sendFilesOutcome = <Value, Body>(
  reply: FastifyReply,
  outcome: FilesOutcome<Value>,
  toBody: (value: Value) => Body,
) => (outcome.outcome === "not-found" ? sendNotFound(reply) : reply.send(toBody(outcome.value)));
