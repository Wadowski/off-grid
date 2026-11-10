// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole, ReadOutcome } from "@offgrid/access-control";
import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
import type { CurrentUserId } from "@offgrid/http";
import type { FastifyRequest } from "fastify";
import type { ModuleDatabase } from "@offgrid/db";
import type { HandlerContext } from "@offgrid/event-bus";

export interface Family {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

export interface FamilySummary {
  readonly id: string;
  readonly name: string;
}

export interface FamilyListEntry extends FamilySummary {
  readonly role: FamilyRole;
  readonly accent: FamilyAccent;
  readonly purpose: FamilyPurpose;
}

export interface FamilyAppearance {
  readonly accent: FamilyAccent;
  readonly purpose: FamilyPurpose;
}

export interface FamilyRecord {
  readonly familyId: string;
  readonly name: string;
  readonly createdAt: Date;
}

export interface NewFamily extends FamilyAppearance {
  readonly id: string;
  readonly name: string;
}

export interface FamilyCreatedInput {
  readonly familyId: string;
  readonly name: string;
}

export interface FamilyMember {
  readonly userId: string;
  readonly displayName: string | null;
  readonly role: FamilyRole;
  readonly joinedAt: string;
}

export interface FamilyMemberRecord {
  readonly userId: string;
  readonly role: string;
  readonly joinedAt: Date;
}

export interface FamilyMemberList {
  readonly members: readonly FamilyMember[];
}

export type MembershipChangeOutcome<Value> =
  ReadOutcome<Value> | { readonly outcome: "last-admin" };

export interface FamilyRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly currentSessionId: (request: FastifyRequest) => string | null;
}

export interface ActiveFamily {
  readonly familyId: string;
}

export type FamilyModuleContext = FamilyRouteContext;

export interface AttemptPolicy {
  readonly limit: number;
  readonly lockoutMs: number;
}

export interface FamilyInvitationCreated {
  readonly invitationId: string;
  readonly code: string;
  readonly expiresAt: Date;
}

export interface FamilyInvitationRef {
  readonly invitationId: string;
}

export interface JoinedFamily {
  readonly familyId: string;
}

export interface InvitationPreview {
  readonly familyId: string;
  readonly familyName: string;
  readonly familyCreatedAt: string;
  readonly invitedBy: { readonly displayName: string | null };
}

export type PreviewOutcome =
  | { readonly outcome: "found"; readonly value: InvitationPreview }
  | { readonly outcome: "invalid" }
  | { readonly outcome: "rate-limited" };

export type RedeemOutcome =
  | { readonly outcome: "joined"; readonly value: JoinedFamily }
  | { readonly outcome: "invalid" }
  | { readonly outcome: "rate-limited" };

export interface NewInvitation {
  readonly familyId: string;
  readonly codeHash: string;
  readonly createdBy: string;
  readonly expiresAt: Date;
  readonly now: Date;
}

export interface InsertedInvitation {
  readonly invitationId: string;
  readonly expiresAt: Date;
}

export type JoinOutcome =
  | { readonly outcome: "joined"; readonly value: JoinedFamily }
  | { readonly outcome: "already-member" }
  | { readonly outcome: "invalid" };

export type SubscriberClient = HandlerContext["tx"];
