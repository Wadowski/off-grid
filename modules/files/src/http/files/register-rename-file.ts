// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, fileSchema, renameFileRequestSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { renameFile } from "../../application/files/rename-file.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { toFile } from "./to-file.js";

export const registerRenameFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.patch(
    "/files/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = renameFileRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const outcome = await renameFile(context.db, userId, params.data.id, body.data.name);
        if (outcome.outcome === "not-found") {
          return sendNotFound(reply);
        }
        return reply.send(fileSchema.parse(toFile(outcome.value)));
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
