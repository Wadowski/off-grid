// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { keepsAnAdmin } from "./keeps-an-admin.js";

describe("keepsAnAdmin", () => {
  it("refuses to remove the only admin", () => {
    expect(keepsAnAdmin({ currentRole: "admin", nextRole: null, adminCount: 1 })).toBe(false);
  });

  it("refuses to demote the only admin", () => {
    expect(keepsAnAdmin({ currentRole: "admin", nextRole: "member", adminCount: 1 })).toBe(false);
  });

  it("allows removing or demoting an admin while another admin remains", () => {
    expect(keepsAnAdmin({ currentRole: "admin", nextRole: null, adminCount: 2 })).toBe(true);
    expect(keepsAnAdmin({ currentRole: "admin", nextRole: "member", adminCount: 2 })).toBe(true);
  });

  it("allows changes to a member, whatever the admin count", () => {
    expect(keepsAnAdmin({ currentRole: "member", nextRole: null, adminCount: 1 })).toBe(true);
    expect(keepsAnAdmin({ currentRole: "member", nextRole: "admin", adminCount: 1 })).toBe(true);
  });
});
