// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { ServerConfig } from "../types.js";
import { assertValidModules } from "./assert-valid-modules.js";
import { modulesFor } from "./modules-for.js";

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

describe("modulesFor", () => {
  it("registers the relations module once, alongside the others", () => {
    const config = { mail: { encryptionKey: Buffer.alloc(32) } } as unknown as ServerConfig;
    const names = modulesFor(config).map((module) => module.name);

    expect(names).toContain("relations");
    expect(() => assertValidModules(modulesFor(config))).not.toThrow();
  });
});
