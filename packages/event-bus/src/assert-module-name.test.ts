// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { assertModuleName } from "./assert-module-name.js";

describe("assertModuleName", () => {
  it("accepts a lowercase module name", () => {
    expect(() => assertModuleName("family")).not.toThrow();
  });

  it.each(["", "Family", "fam-ily", "1family", "outbox"])("refuses %j", (runAs) => {
    expect(() => assertModuleName(runAs)).toThrow(/invalid module name/);
  });
});
