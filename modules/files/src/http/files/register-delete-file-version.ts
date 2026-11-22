// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileVersionParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { deleteFileVersion } from "../../application/files/delete-file-version.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { sendIsFolder } from "./send-is-folder.js";

export const registerDeleteFileVersion = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.delete(
    "/files/:id/versions/:versionId",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileVersionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        const outcome = await deleteFileVersion(
          { db: context.db, storage: context.storage },
          userId,
          params.data.id,
          params.data.versionId,
        );
        if (outcome.outcome === "not-found") {
          return sendNotFound(reply);
        }
        if (outcome.outcome === "folder") {
          return sendIsFolder(reply);
        }
        return reply.code(204).send();
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
