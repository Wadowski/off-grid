// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyReply } from "fastify";
import type { ReadOutcome } from "@offgrid/access-control";
import { sendNotFound } from "./send-not-found.js";
import { sendAccessDenied } from "./send-access-denied.js";

export const sendReadOutcome = <Value>(reply: FastifyReply, outcome: ReadOutcome<Value>) => {
  if (outcome.outcome === "not-found") {
    return sendNotFound(reply);
  }
  if (outcome.outcome === "forbidden") {
    return sendAccessDenied(reply);
  }
  return reply.send(outcome.value);
};
