// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileSchema, fileVersionParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { restoreFileVersion } from "../../application/files/restore-file-version.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { sendIsFolder } from "./send-is-folder.js";
import { toFile } from "./to-file.js";

export const registerRestoreFileVersion = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.post(
    "/files/:id/versions/:versionId/restore",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileVersionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        const outcome = await restoreFileVersion(
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
        return reply.send(fileSchema.parse(toFile(outcome.value)));
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
