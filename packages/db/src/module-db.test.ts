// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { quoteIdent } from "./quote-ident.js";

describe("quoteIdent", () => {
  it("quotes a valid identifier", () => {
    expect(quoteIdent("family_owner")).toBe('"family_owner"');
  });

  it("refuses anything that could carry SQL", () => {
    expect(() => quoteIdent('family"; DROP TABLE x; --')).toThrow(/invalid SQL identifier/);
    expect(() => quoteIdent("Family")).toThrow(/invalid SQL identifier/);
  });
});
