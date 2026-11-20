// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isNameConflict } from "./is-name-conflict.js";

describe("isNameConflict", () => {
  it("recognises a unique violation on the files model", () => {
    expect(isNameConflict({ code: "P2002", meta: { modelName: "FilesFile" } })).toBe(true);
  });

  it("ignores a unique violation on another model", () => {
    expect(isNameConflict({ code: "P2002", meta: { modelName: "FilesDrive" } })).toBe(false);
  });

  it("ignores other error codes", () => {
    expect(isNameConflict({ code: "P2025", meta: { modelName: "FilesFile" } })).toBe(false);
  });

  it("ignores values that are not errors", () => {
    expect(isNameConflict(new Error("boom"))).toBe(false);
    expect(isNameConflict(null)).toBe(false);
  });
});
