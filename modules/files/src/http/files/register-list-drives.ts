// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveListSchema } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listDrivesFor } from "../../application/drives/list-drives-for.js";
import type { FilesRouteContext } from "../../types.js";
import { toDrive } from "./to-drive.js";

export const registerListDrives = (api: FastifyInstance, context: FilesRouteContext): void => {
  api.get(
    "/drives",
    withUser(context.currentUserId, async (_request, reply, userId) => {
      const records = await listDrivesFor(context.db, userId);
      return reply.send(driveListSchema.parse({ drives: records.map(toDrive) }));
    }),
  );
};
