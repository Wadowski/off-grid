// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole, ReadOutcome } from "@offgrid/access-control";
import type { CurrentUserId } from "@offgrid/http";
import type { ModuleDatabase } from "@offgrid/db";

export interface Family {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

export interface FamilySummary {
  readonly id: string;
  readonly name: string;
}

export interface FamilyRecord {
  readonly familyId: string;
  readonly name: string;
  readonly createdAt: Date;
}

export interface NewFamily {
  readonly id: string;
  readonly name: string;
}

export interface FamilyCreatedInput {
  readonly familyId: string;
  readonly name: string;
}

export interface FamilyMember {
  readonly userId: string;
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
}

export type FamilyModuleContext = FamilyRouteContext;
