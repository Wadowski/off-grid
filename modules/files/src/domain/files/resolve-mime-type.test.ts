// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { resolveMimeType } from "./resolve-mime-type.js";

describe("resolveMimeType", () => {
  it("keeps the declared media type over the file name", () => {
    expect(resolveMimeType("image/webp", "notes.txt")).toBe("image/webp");
  });

  it("takes the type from the extension when none is declared", () => {
    expect(resolveMimeType(null, "Holiday.PDF")).toBe("application/pdf");
  });

  it("falls back to octet-stream for an unknown extension", () => {
    expect(resolveMimeType(null, "archive.unknownext")).toBe("application/octet-stream");
  });

  it("falls back to octet-stream when the name has no extension", () => {
    expect(resolveMimeType(null, "README")).toBe("application/octet-stream");
  });

  it("falls back to octet-stream for a dot file without an extension", () => {
    expect(resolveMimeType(null, ".gitignore")).toBe("application/octet-stream");
  });

  it("does not read object prototype keys as extensions", () => {
    expect(resolveMimeType(null, "file.constructor")).toBe("application/octet-stream");
  });
});
