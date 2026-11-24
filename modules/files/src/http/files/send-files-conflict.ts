// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import {
  CURRENT_VERSION_MESSAGE,
  INVALID_MOVE_MESSAGE,
  NAME_TAKEN_MESSAGE,
  NOT_TRASHED_MESSAGE,
} from "../../constants.js";
import { CurrentVersionError } from "../../application/errors/current-version-error.js";
import { InvalidMoveError } from "../../application/errors/invalid-move-error.js";
import { NameTakenError } from "../../application/errors/name-taken-error.js";
import { NotTrashedError } from "../../application/errors/not-trashed-error.js";
import { UploadTooLargeError } from "../../application/errors/upload-too-large-error.js";
import { sendPayloadTooLarge } from "./send-payload-too-large.js";

export const sendFilesConflict = (reply: FastifyReply, error: unknown) => {
  if (error instanceof NameTakenError) {
    return sendError(reply, 409, "NAME_TAKEN", NAME_TAKEN_MESSAGE);
  }
  if (error instanceof InvalidMoveError) {
    return sendError(reply, 409, "INVALID_MOVE", INVALID_MOVE_MESSAGE);
  }
  if (error instanceof CurrentVersionError) {
    return sendError(reply, 409, "CURRENT_VERSION", CURRENT_VERSION_MESSAGE);
  }
  if (error instanceof NotTrashedError) {
    return sendError(reply, 409, "NOT_TRASHED", NOT_TRASHED_MESSAGE);
  }
  if (error instanceof UploadTooLargeError) {
    return sendPayloadTooLarge(reply);
  }
  throw error;
};
