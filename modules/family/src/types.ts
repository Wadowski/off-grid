// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

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
  readonly creatorUserId: string;
}

export interface FamilyRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
}

export type FamilyModuleContext = FamilyRouteContext;
