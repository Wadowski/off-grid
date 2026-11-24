// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveParamsSchema, fileListSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listDriveTrash } from "../../application/trash/list-drive-trash.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesOutcome } from "../files/send-files-outcome.js";
import { toFileList } from "../files/to-file-list.js";
import { toTrashQuery } from "./to-trash-query.js";
import { trashQuerySchema } from "./trash-query-schema.js";

export const registerListDriveTrash = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.get(
    "/drives/:id/trash",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = driveParamsSchema.safeParse(request.params);
      const query = trashQuerySchema.safeParse(request.query);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      const outcome = await listDriveTrash(
        context.db,
        userId,
        params.data.id,
        toTrashQuery(query.data),
      );
      return sendFilesOutcome(reply, outcome, (listed) => fileListSchema.parse(toFileList(listed)));
    }),
  );
};
