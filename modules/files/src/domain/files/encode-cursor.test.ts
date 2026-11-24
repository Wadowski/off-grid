// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { decodeCursor } from "./decode-cursor.js";
import { encodeCursor } from "./encode-cursor.js";

const CURSOR = {
  isFolder: true,
  fileId: "22222222-2222-4222-8222-222222222222",
  sort: "modified" as const,
  direction: "desc" as const,
  sortValue: "2026-11-01T10:00:00.000Z",
};

describe("encodeCursor", () => {
  it("writes a url-safe string that decodes back to the same position", () => {
    const encoded = encodeCursor(CURSOR);

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeCursor(encoded)).toEqual(CURSOR);
  });
});
