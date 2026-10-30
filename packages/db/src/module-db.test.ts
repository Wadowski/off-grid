// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { moduleConnectionString } from "./module-connection-string.js";
import { quoteIdent } from "./quote-ident.js";

const target = { host: "db.internal", port: 5432, database: "offgrid", password: "p@ss:w/rd#1" };

describe("moduleConnectionString", () => {
  it("connects as the runtime role of the module", () => {
    const url = new URL(moduleConnectionString(target, "lists"));
    expect(url.username).toBe("lists_app");
    expect(url.hostname).toBe("db.internal");
    expect(url.pathname).toBe("/offgrid");
  });

  it("URL-encodes the password so special characters survive", () => {
    const url = new URL(moduleConnectionString(target, "family"));
    expect(decodeURIComponent(url.password)).toBe(target.password);
  });
});

describe("quoteIdent", () => {
  it("quotes a valid identifier", () => {
    expect(quoteIdent("family_owner")).toBe('"family_owner"');
  });

  it("refuses anything that could carry SQL", () => {
    expect(() => quoteIdent('family"; DROP TABLE x; --')).toThrow(/invalid SQL identifier/);
    expect(() => quoteIdent("Family")).toThrow(/invalid SQL identifier/);
  });
});
