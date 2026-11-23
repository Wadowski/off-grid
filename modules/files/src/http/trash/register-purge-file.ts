// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { purgeFile } from "../../application/trash/purge-file.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "../files/send-files-conflict.js";

export const registerPurgeFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.delete(
    "/files/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        const outcome = await purgeFile(context.db, context.storage, userId, params.data.id);
        if (outcome.outcome === "not-found") {
          return sendNotFound(reply);
        }
        return reply.code(204).send();
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
