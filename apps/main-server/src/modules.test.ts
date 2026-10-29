// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { assertValidModules } from "./modules.js";

describe("assertValidModules", () => {
  it("accepts an empty registry and distinct lowercase names", () => {
    expect(() => assertValidModules([])).not.toThrow();
    expect(() => assertValidModules([{ name: "family" }, { name: "lists2" }])).not.toThrow();
  });

  it("rejects a module name registered twice", () => {
    expect(() => assertValidModules([{ name: "family" }, { name: "family" }])).toThrow(
      'module "family" is registered more than once',
    );
  });

  it("rejects a module name that is not a lowercase identifier", () => {
    expect(() => assertValidModules([{ name: "Family-Module" }])).toThrow(
      /lowercase letters and digits/,
    );
  });
});
