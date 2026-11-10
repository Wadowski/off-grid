// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
export type FamilySummary = {
  readonly id: string;
  readonly name: string;
};

export type ListStatus = "loading" | "ready" | "failed";

export type CreateFamilyStatus = "idle" | "submitting" | "failed";

export type FamilyNameErrorTextId = "families.nameRequired" | "families.nameTooLong";

export type FamilySpace = FamilySummary & {
  readonly role: CurrentUserRole;
  readonly accent: FamilyAccent;
  readonly purpose: FamilyPurpose;
};

export type FamilyAppearance = {
  readonly accent: FamilyAccent;
  readonly purpose: FamilyPurpose;
};

export type FamiliesContext = {
  readonly families: readonly FamilySpace[];
  readonly listStatus: ListStatus;
  readonly createStatus: CreateFamilyStatus;
  readonly submitFamily: (name: string, appearance?: FamilyAppearance) => Promise<boolean>;
  readonly refreshFamilies: () => Promise<void>;
};

export type CurrentUserRole = "admin" | "member";

export type CurrentUser = {
  readonly name: string;
  readonly email: string;
  readonly role: CurrentUserRole;
};

export type SessionUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly instanceRole: "admin" | "user";
};
