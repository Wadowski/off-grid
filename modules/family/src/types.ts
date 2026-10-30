// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadOutcome } from "@offgrid/access-control";
import type { CurrentUserId } from "@offgrid/http";
import type { Pool } from "pg";

export interface Family {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

export interface FamilySummary {
  readonly id: string;
  readonly name: string;
}

export interface FamilyRow {
  readonly family_id: string;
  readonly name: string;
  readonly created_at: Date;
}

export interface NewFamily {
  readonly id: string;
  readonly name: string;
}

export interface FamilyCreatedInput {
  readonly familyId: string;
  readonly name: string;
  readonly creatorUserId: string;
}

export type FamilyPool = Pick<Pool, "connect">;

export type GetFamilyOutcome = ReadOutcome<Family>;

export interface FamilyRouteContext {
  readonly pool: FamilyPool;
  readonly currentUserId: CurrentUserId;
}

export type FamilyModuleContext = FamilyRouteContext;
