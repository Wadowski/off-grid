// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { uploadLimitSchema } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import type { FilesRouteContext } from "../../types.js";

export const registerGetUploadLimit = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.get(
    "/files/upload-limit",
    withUser(context.currentUserId, async (_request, reply) =>
      reply.send(uploadLimitSchema.parse({ maxUploadBytes: context.maxUploadBytes })),
    ),
  );
};
