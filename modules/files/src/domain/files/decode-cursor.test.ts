// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { decodeCursor } from "./decode-cursor.js";

const FILE_ID = "22222222-2222-4222-8222-222222222222";

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

  it("reads a cursor without a sort as the name order it was made for", () => {
    expect(decodeCursor(encodeJson({ isFolder: false, name: "b.txt", fileId: FILE_ID }))).toEqual({
      isFolder: false,
      fileId: FILE_ID,
      sort: "name",
      direction: "asc",
      sortValue: "b.txt",
    });
  });

  it("returns null for a modified-date sort whose value is not a date", () => {
    expect(
      decodeCursor(
        encodeJson({
          isFolder: false,
          fileId: FILE_ID,
          sort: "modified",
          direction: "asc",
          sortValue: "yesterday",
        }),
      ),
    ).toBeNull();
  });

  it("returns null for a size sort whose value is not a whole number of bytes", () => {
    expect(
      decodeCursor(
        encodeJson({
          isFolder: false,
          fileId: FILE_ID,
          sort: "size",
          direction: "asc",
          sortValue: "1.5",
        }),
      ),
    ).toBeNull();
  });

  it("returns null for a sort field that is not offered", () => {
    expect(
      decodeCursor(
        encodeJson({
          isFolder: false,
          fileId: FILE_ID,
          sort: "type",
          direction: "asc",
          sortValue: "x",
        }),
      ),
    ).toBeNull();
  });
});
