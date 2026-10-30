// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFamilyRequestSchema, familyIdSchema } from "@offgrid/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FamilyService } from "../application/family-service.js";
import { InvalidFamilyNameError } from "../domain/family.js";

export type CurrentUserId = (request: FastifyRequest) => string | null;

export function registerFamilyRoutes(
  api: FastifyInstance,
  service: FamilyService,
  currentUserId: CurrentUserId,
): void {
  api.post("/families", async (request, reply) => {
    const userId = currentUserId(request);
    if (userId === null) {
      return unauthenticated(reply);
    }
    const body = createFamilyRequestSchema.safeParse(request.body);
    if (!body.success) {
      return validationFailed(reply, "family name must be 1 to 100 characters");
    }
    try {
      const family = await service.createFamily(userId, body.data.name);
      return reply.code(201).send(family);
    } catch (error) {
      if (error instanceof InvalidFamilyNameError) {
        return validationFailed(reply, error.message);
      }
      throw error;
    }
  });

  api.get("/families", async (request, reply) => {
    const userId = currentUserId(request);
    if (userId === null) {
      return unauthenticated(reply);
    }
    return reply.send({ families: await service.listMyFamilies(userId) });
  });

  api.get<{ Params: { id: string } }>("/families/:id", async (request, reply) => {
    const userId = currentUserId(request);
    if (userId === null) {
      return unauthenticated(reply);
    }
    const familyId = familyIdSchema.safeParse(request.params.id);
    if (!familyId.success) {
      return validationFailed(reply, "family id must be a UUID");
    }
    const view = await service.getFamily(userId, familyId.data);
    if (view.outcome === "not-found") {
      return reply.code(404).send({ code: "FAMILY_NOT_FOUND", message: "Family not found" });
    }
    if (view.outcome === "forbidden") {
      return reply
        .code(403)
        .send({ code: "ACCESS_DENIED", message: "You are not a member of this family" });
    }
    return reply.send(view.family);
  });
}

function unauthenticated(reply: FastifyReply) {
  return reply.code(401).send({ code: "UNAUTHENTICATED", message: "Sign in to continue" });
}

function validationFailed(reply: FastifyReply, message: string) {
  return reply.code(400).send({ code: "VALIDATION_FAILED", message });
}
