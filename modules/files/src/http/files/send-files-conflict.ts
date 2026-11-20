// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { INVALID_MOVE_MESSAGE, NAME_TAKEN_MESSAGE } from "../../constants.js";
import { InvalidMoveError } from "../../application/errors/invalid-move-error.js";
import { NameTakenError } from "../../application/errors/name-taken-error.js";

export const sendFilesConflict = (reply: FastifyReply, error: unknown) => {
  if (error instanceof NameTakenError) {
    return sendError(reply, 409, "NAME_TAKEN", NAME_TAKEN_MESSAGE);
  }
  if (error instanceof InvalidMoveError) {
    return sendError(reply, 409, "INVALID_MOVE", INVALID_MOVE_MESSAGE);
  }
  throw error;
};
