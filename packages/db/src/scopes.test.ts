// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { scopeViolation } from "./scopes.js";

const declared = (
  scope: string,
  columns: { family?: boolean; user?: boolean; rls?: boolean } = {},
) => ({
  comment: `offgrid:scope=${scope}`,
  rls: columns.rls ?? true,
  has_family: columns.family ?? false,
  has_user: columns.user ?? false,
});

describe("scopeViolation", () => {
  it("accepts a family-or-user table with both owner columns and RLS", () => {
    expect(scopeViolation(declared("family-or-user", { family: true, user: true }))).toBeNull();
  });

  it("accepts a family table with family_id and RLS", () => {
    expect(scopeViolation(declared("family", { family: true }))).toBeNull();
  });

  it("accepts a user table with user_id and RLS", () => {
    expect(scopeViolation(declared("user", { user: true }))).toBeNull();
  });

  it("accepts a shared table with no owner column", () => {
    expect(scopeViolation(declared("shared", { rls: false }))).toBeNull();
  });

  it("reports a table with no declared scope", () => {
    expect(
      scopeViolation({ comment: null, rls: false, has_family: true, has_user: false }),
    ).toMatch(/no ownership scope declared/);
  });

  it("reports an unknown scope name", () => {
    expect(scopeViolation(declared("everyone", { family: true }))).toMatch(
      /unknown ownership scope/,
    );
  });

  it("reports an owned table without row level security", () => {
    expect(scopeViolation(declared("family", { family: true, rls: false }))).toMatch(
      /requires row level security/,
    );
  });

  it("reports a family-or-user table missing its user column", () => {
    expect(scopeViolation(declared("family-or-user", { family: true }))).toMatch(
      /requires user_id/,
    );
  });

  it("reports a shared table that holds an owner column", () => {
    expect(scopeViolation(declared("shared", { user: true }))).toMatch(
      /shared table has an owner column/,
    );
  });
});
