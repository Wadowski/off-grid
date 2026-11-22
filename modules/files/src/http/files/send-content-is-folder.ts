// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendError } from "@offgrid/http";
import type { FastifyReply } from "fastify";
import { IS_FOLDER_CONTENT_MESSAGE } from "../../constants.js";

export const sendContentIsFolder = (reply: FastifyReply) =>
  sendError(reply, 400, "IS_FOLDER", IS_FOLDER_CONTENT_MESSAGE);
