// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, moveFileRequestSchema, moveFileResultSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { moveFile } from "../../application/files/move-file.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { toMoveFileResult } from "./to-move-file-result.js";

export const registerMoveFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.post(
    "/files/:id/move",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = moveFileRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const outcome = await moveFile(context.db, userId, params.data.id, body.data);
        if (outcome.outcome === "not-found") {
          return sendNotFound(reply);
        }
        return reply.send(moveFileResultSchema.parse(toMoveFileResult(outcome.value)));
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
