// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FamilySummary = {
  readonly id: string;
  readonly name: string;
};

export type ListStatus = "loading" | "ready" | "failed";

export type CreateFamilyStatus = "idle" | "submitting" | "failed";

export type FamilyNameErrorTextId = "families.nameRequired" | "families.nameTooLong";

export type FamilyRole = "admin" | "member";

export type FamilySpace = FamilySummary & {
  readonly role: FamilyRole;
};

export type FamiliesContext = {
  readonly families: readonly FamilySpace[];
  readonly listStatus: ListStatus;
  readonly createStatus: CreateFamilyStatus;
  readonly submitFamily: (name: string) => Promise<boolean>;
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
