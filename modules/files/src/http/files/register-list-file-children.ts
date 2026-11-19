// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListSchema, fileParamsSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listFolderChildren } from "../../application/files/list-folder-children.js";
import type { FilesRouteContext } from "../../types.js";
import { childrenQuerySchema } from "./children-query-schema.js";
import { sendFilesOutcome } from "./send-files-outcome.js";
import { toChildrenQuery } from "./to-children-query.js";
import { toFileList } from "./to-file-list.js";

export const registerListFileChildren = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.get(
    "/files/:id/children",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      const query = childrenQuerySchema.safeParse(request.query);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      const outcome = await listFolderChildren(
        context.db,
        userId,
        params.data.id,
        toChildrenQuery(query.data),
      );
      return sendFilesOutcome(reply, outcome, (listed) => fileListSchema.parse(toFileList(listed)));
    }),
  );
};
