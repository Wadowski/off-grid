// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { restoreArguments } from "./postgres-tools.js";

const TARGET = {
  host: "db.internal",
  port: 5432,
  database: "offgrid",
  user: "offgrid_migrator",
  password: "migrator-secret-value",
};

describe("restoreArguments", () => {
  it("restores in one transaction, stops on the first error, and cleans first", () => {
    expect(restoreArguments(TARGET, "/backups/x/database.dump")).toEqual([
      "--clean",
      "--if-exists",
      "--single-transaction",
      "--exit-on-error",
      "--host",
      "db.internal",
      "--port",
      "5432",
      "--username",
      "offgrid_migrator",
      "--dbname",
      "offgrid",
      "/backups/x/database.dump",
    ]);
  });

  it("never puts the password on the command line", () => {
    expect(restoreArguments(TARGET, "/backups/x/database.dump")).not.toContain(
      "migrator-secret-value",
    );
  });
});
