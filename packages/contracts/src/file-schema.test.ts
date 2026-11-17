// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { fileNameSchema } from "./file-name-schema.js";
import { fileSchema } from "./file-schema.js";

const ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const TIMESTAMP = "2026-01-02T03:04:05.000Z";

const baseEntry = {
  id: ID,
  driveId: ID,
  parentId: null,
  name: "Report.pdf",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
};

const folderEntry = { ...baseEntry, isFolder: true };

const regularFileEntry = {
  ...baseEntry,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: ID,
};

describe("fileNameSchema", () => {
  it("accepts a plain name and trims surrounding whitespace", () => {
    expect(fileNameSchema.parse("  Holiday photos  ")).toBe("Holiday photos");
  });

  it("accepts unicode names and names with inner dots", () => {
    expect(fileNameSchema.parse("Zażółć.gęślą.jaźń.txt")).toBe("Zażółć.gęślą.jaźń.txt");
  });

  it("accepts a name of exactly 255 characters", () => {
    const name = "a".repeat(255);
    expect(fileNameSchema.parse(name)).toBe(name);
  });

  it.each([
    ["an empty string", ""],
    ["a whitespace-only string", "   "],
    ["a name longer than 255 characters", "a".repeat(256)],
    ["a forward slash", "a/b"],
    ["a backslash", "a\\b"],
    ["a NUL character", "a\u0000b"],
    ["a single dot", "."],
    ["a double dot", ".."],
  ])("rejects %s", (_label, name) => {
    expect(fileNameSchema.safeParse(name).success).toBe(false);
  });
});

describe("fileSchema", () => {
  it("parses a folder without size, mime type or current version", () => {
    expect(fileSchema.parse(folderEntry)).toEqual(folderEntry);
  });

  it("parses a regular file with mime type, size and current version", () => {
    expect(fileSchema.parse(regularFileEntry)).toEqual(regularFileEntry);
  });

  it("rejects an entry marked as a regular file without its file fields", () => {
    expect(fileSchema.safeParse({ ...folderEntry, isFolder: false }).success).toBe(false);
  });

  it("rejects a regular file without a current version", () => {
    expect(fileSchema.safeParse({ ...regularFileEntry, currentVersionId: undefined }).success).toBe(
      false,
    );
  });

  it("rejects a malformed id", () => {
    expect(fileSchema.safeParse({ ...folderEntry, id: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects a negative size", () => {
    expect(fileSchema.safeParse({ ...regularFileEntry, size: -1 }).success).toBe(false);
  });

  it("rejects a name that fails the name rule", () => {
    expect(fileSchema.safeParse({ ...folderEntry, name: "../etc" }).success).toBe(false);
  });
});
