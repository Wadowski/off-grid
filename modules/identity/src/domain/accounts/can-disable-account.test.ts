// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { AccountSnapshot } from "../../types.js";
import { canDisableAccount } from "./can-disable-account.js";

const admin = (userId: string): AccountSnapshot => ({
  userId,
  instanceRole: "admin",
  status: "active",
});
const member = (userId: string): AccountSnapshot => ({
  userId,
  instanceRole: "user",
  status: "active",
});

describe("canDisableAccount", () => {
  it("refuses to disable the only active admin", () => {
    expect(canDisableAccount([admin("a"), member("b")], "a")).toBe(false);
  });

  it("allows disabling an admin when another active admin remains", () => {
    expect(canDisableAccount([admin("a"), admin("b")], "a")).toBe(true);
  });

  it("allows disabling a regular user", () => {
    expect(canDisableAccount([admin("a"), member("b")], "b")).toBe(true);
  });

  it("allows disabling an admin who is already disabled", () => {
    const disabledAdmin: AccountSnapshot = {
      userId: "b",
      instanceRole: "admin",
      status: "disabled",
    };

    expect(canDisableAccount([admin("a"), disabledAdmin], "b")).toBe(true);
  });
});
