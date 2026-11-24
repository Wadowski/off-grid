// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, fileSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { trashFile } from "../../application/trash/trash-file.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesOutcome } from "../files/send-files-outcome.js";
import { toFile } from "../files/to-file.js";

export const registerTrashFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.post(
    "/files/:id/trash",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await trashFile(context.db, userId, params.data.id);
      return sendFilesOutcome(reply, outcome, (file) => fileSchema.parse(toFile(file)));
    }),
  );
};
