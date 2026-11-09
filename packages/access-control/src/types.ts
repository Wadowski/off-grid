// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type AccessGroupKind = "family" | "user";

export type AccessGroup = {
  id: string;
  kind: AccessGroupKind;
};

export type AccessType = "view" | "edit" | "manage";

export type Action = AccessType;

export type AccessGrant = {
  group: AccessGroup;
  access: AccessType;
};

export type Subject = {
  userId: string;
  groups: readonly AccessGroup[];
};

export type Resource = {
  owner: AccessGroup;
  grants: readonly AccessGrant[];
};

export type VisibilityFilter = {
  groupIds: readonly string[];
};

export type ReadOutcome<Value> =
  | { readonly outcome: "found"; readonly value: Value }
  | { readonly outcome: "not-found" }
  | { readonly outcome: "forbidden" };

export type ReadOutcomeInput<Value> = {
  readonly value: Value | null;
  readonly subject: Subject;
  readonly resource: Resource;
};

export type FamilyRole = "admin" | "member";
