// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { canManageFamilyMembers } from "./can-manage-family-members.js";

describe("canManageFamilyMembers", () => {
  it("allows an admin to change roles and remove members", () => {
    expect(canManageFamilyMembers("admin")).toBe(true);
  });

  it("refuses a member", () => {
    expect(canManageFamilyMembers("member")).toBe(false);
  });
});
