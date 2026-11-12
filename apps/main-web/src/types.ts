// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
import type { Calendar } from "./calendars/types.js";
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

export type CalendarsState = {
  readonly calendars: readonly Calendar[];
  readonly listStatus: ListStatus;
  readonly refreshCalendars: () => Promise<void>;
};

export type ShellContext = FamiliesContext & {
  readonly calendars: CalendarsState;
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

export type FamilyMember = {
  readonly userId: string;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
  readonly joinedAt: string;
};
