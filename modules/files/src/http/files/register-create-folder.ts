// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFolderRequestSchema, driveParamsSchema, fileSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createFolder } from "../../application/files/create-folder.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesConflict } from "./send-files-conflict.js";
import { toFile } from "./to-file.js";

export const registerCreateFolder = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.post(
    "/drives/:id/folders",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = driveParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = createFolderRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const outcome = await createFolder(context.db, userId, params.data.id, body.data);
        if (outcome.outcome === "not-found") {
          return sendNotFound(reply);
        }
        return reply.code(201).send(fileSchema.parse(toFile(outcome.value)));
      } catch (error) {
        return sendFilesConflict(reply, error);
      }
    }),
  );
};
