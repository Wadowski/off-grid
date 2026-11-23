// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileContentQuerySchema, fileVersionParamsSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import type { FilesRouteContext } from "../../types.js";
import { respondWithFileContent } from "./respond-with-file-content.js";

export const registerDownloadFileVersion = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.get(
    "/files/:id/versions/:versionId/content",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileVersionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const query = fileContentQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      return respondWithFileContent(
        reply,
        context,
        userId,
        {
          fileId: params.data.id,
          versionId: params.data.versionId,
          rangeHeader: request.headers.range,
        },
        query.data.disposition,
      );
    }),
  );
};
