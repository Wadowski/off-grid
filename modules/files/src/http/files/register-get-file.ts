// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileDetailsSchema, fileParamsSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { getFileDetails } from "../../application/files/get-file-details.js";
import type { FilesRouteContext } from "../../types.js";
import { sendFilesOutcome } from "./send-files-outcome.js";
import { toFileDetails } from "./to-file-details.js";

export const registerGetFile = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.get(
    "/files/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = fileParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await getFileDetails(context.db, userId, params.data.id);
      return sendFilesOutcome(reply, outcome, (details) =>
        fileDetailsSchema.parse(toFileDetails(details)),
      );
    }),
  );
};
