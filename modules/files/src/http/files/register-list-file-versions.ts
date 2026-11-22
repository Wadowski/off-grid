// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileParamsSchema, fileVersionListSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listFileVersions } from "../../application/files/list-file-versions.js";
import type { FilesRouteContext } from "../../types.js";
import { sendIsFolder } from "./send-is-folder.js";
import { toFileVersion } from "./to-file-version.js";

export const registerListFileVersions = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.get(
    "/files/:id/versions",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await listFileVersions(context.db, userId, params.data.id);
      if (outcome.outcome === "not-found") {
        return sendNotFound(reply);
      }
      if (outcome.outcome === "folder") {
        return sendIsFolder(reply);
      }
      return reply.send(
        fileVersionListSchema.parse({ versions: outcome.value.map(toFileVersion) }),
      );
    }),
  );
};
