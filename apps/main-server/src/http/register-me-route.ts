// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import { listMyFamilies } from "@offgrid/family";
import { getOwnProfile } from "@offgrid/identity";
import type { FastifyInstance } from "fastify";
import { moduleContextFor } from "../module-wiring/module-context-for.js";
import { moduleDatabaseFor } from "../module-wiring/module-database-for.js";
import type { ServerRuntime } from "../types.js";

export const registerMeRoute = (api: FastifyInstance, runtime: ServerRuntime): void => {
  const identity = moduleContextFor(runtime, "identity");
  api.get(
    accountRoutes.me,
    withUser(identity.currentUserId, async (_request, reply, userId) => {
      const [profile, families] = await Promise.all([
        getOwnProfile(identity.db, userId),
        listMyFamilies(moduleDatabaseFor(runtime, "family"), userId),
      ]);
      return reply.send({ ...profile, families });
    }),
  );
};
