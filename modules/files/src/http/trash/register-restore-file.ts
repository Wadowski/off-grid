// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, fileSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { restoreFile } from "../../application/trash/restore-file.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "../files/send-files-conflict.js";
import { sendFilesOutcome } from "../files/send-files-outcome.js";
import { toFile } from "../files/to-file.js";

export const registerRestoreFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.post(
    "/files/:id/restore",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        const outcome = await restoreFile(context.db, userId, params.data.id);
        return sendFilesOutcome(reply, outcome, (file) => fileSchema.parse(toFile(file)));
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
