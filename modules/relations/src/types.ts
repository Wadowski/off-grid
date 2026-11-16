// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { linkableEntityTypeSchema } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { CurrentUserId } from "@offgrid/http";
import type { FastifyRequest } from "fastify";
import type { z } from "zod";

export type LinkableEntityType = z.output<typeof linkableEntityTypeSchema>;

export type CurrentFamilyId = (request: FastifyRequest) => string | null;

export interface RelationsRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly currentFamilyId: CurrentFamilyId;
}

export interface RelationsSubscriberContext {
  readonly eventBus: EventBus;
  readonly db: ModuleDatabase;
}

export interface LinkEndpoint {
  readonly entityType: LinkableEntityType;
  readonly entityId: string;
}

export interface ActingContext {
  readonly userId: string;
  readonly familyId: string | null;
}

export interface LinkOwner {
  readonly familyId: string | null;
  readonly userId: string | null;
}

export interface CrossEntityLinkRecord {
  readonly linkId: string;
  readonly source: LinkEndpoint;
  readonly target: LinkEndpoint;
  readonly createdAt: Date;
}

export interface CrossEntityLinkWithTitle {
  readonly link: CrossEntityLinkRecord;
  readonly otherEnd: LinkEndpoint;
  readonly title: string;
}

export type CrossEntityLinkOutcome<Value> =
  { readonly outcome: "found"; readonly value: Value } | { readonly outcome: "not-found" };

export type CreateCrossEntityLinkOutcome =
  | { readonly outcome: "created"; readonly value: CrossEntityLinkRecord }
  | { readonly outcome: "existing"; readonly value: CrossEntityLinkRecord }
  | { readonly outcome: "conflict" }
  | { readonly outcome: "not-found" }
  | { readonly outcome: "self-link" };

export interface NewCrossEntityLink {
  readonly linkId: string;
  readonly source: LinkEndpoint;
  readonly target: LinkEndpoint;
  readonly owner: LinkOwner;
  readonly createdBy: string;
}

export interface CrossEntityLinkRow {
  readonly linkId: string;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly createdAt: Date;
}
