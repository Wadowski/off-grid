// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { assertIsolatedDatabaseName } from "./assert-isolated-database-name.js";

describe("assertIsolatedDatabaseName", () => {
  it("accepts a name in the shape createIsolatedDatabase generates", () => {
    expect(() => assertIsolatedDatabaseName(`offgrid_test_${"a1".repeat(12)}`)).not.toThrow();
  });

  it.each([
    ["a name outside the prefix", "postgres"],
    ["a name with a quote that would end the identifier", `offgrid_test_${"a".repeat(23)}"`],
    ["a name with a semicolon", "offgrid_test_aaaaaaaaaaaaaaaaaaaaaaaa;DROP"],
    ["an uppercase hex name", `offgrid_test_${"A".repeat(24)}`],
    ["a name one character short", `offgrid_test_${"a".repeat(23)}`],
    ["a name with a trailing newline", `offgrid_test_${"a".repeat(24)}\n`],
  ])("rejects %s", (_description, name) => {
    expect(() => assertIsolatedDatabaseName(name)).toThrow(/isolated test database name/);
  });
});
