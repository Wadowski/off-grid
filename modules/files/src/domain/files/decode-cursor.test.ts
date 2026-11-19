// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { decodeCursor } from "./decode-cursor.js";

const encodeJson = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

describe("decodeCursor", () => {
  it("returns null for text that is not base64url-encoded JSON", () => {
    expect(decodeCursor("%%%not-a-cursor%%%")).toBeNull();
  });

  it("returns null for JSON with the wrong shape", () => {
    expect(decodeCursor(encodeJson({ isFolder: "yes", name: "x" }))).toBeNull();
  });

  it("returns null when the file id is not a uuid", () => {
    expect(decodeCursor(encodeJson({ isFolder: false, name: "a", fileId: "nope" }))).toBeNull();
  });

  it("returns null for an empty name", () => {
    expect(
      decodeCursor(
        encodeJson({ isFolder: false, name: "", fileId: "22222222-2222-4222-8222-222222222222" }),
      ),
    ).toBeNull();
  });
});
