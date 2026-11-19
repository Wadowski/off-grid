// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveParamsSchema, fileListSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listDriveChildren } from "../../application/files/list-drive-children.js";
import type { FilesRouteContext } from "../../types.js";
import { childrenQuerySchema } from "./children-query-schema.js";
import { sendFilesOutcome } from "./send-files-outcome.js";
import { toChildrenQuery } from "./to-children-query.js";
import { toFileList } from "./to-file-list.js";

export const registerListDriveChildren = (
  api: FastifyInstance,
  context: FilesRouteContext,
): void => {
  api.get(
    "/drives/:id/children",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = driveParamsSchema.safeParse(request.params);
      const query = childrenQuerySchema.safeParse(request.query);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      const outcome = await listDriveChildren(
        context.db,
        userId,
        params.data.id,
        toChildrenQuery(query.data),
      );
      return sendFilesOutcome(reply, outcome, (listed) => fileListSchema.parse(toFileList(listed)));
    }),
  );
};
