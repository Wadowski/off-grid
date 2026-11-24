// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { emptyDriveTrash } from "../../application/trash/empty-drive-trash.js";
import type { FilesRouteContext } from "../../types.js";

export const registerEmptyDriveTrash = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.delete(
    "/drives/:id/trash",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = driveParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await emptyDriveTrash(context.db, context.storage, userId, params.data.id);
      if (outcome.outcome === "not-found") {
        return sendNotFound(reply);
      }
      return reply.code(204).send();
    }),
  );
};
