// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toFileVersionRows } from "./to-file-version-rows.js";
import type { FileVersion } from "./types.js";

const version = (number: number, createdByUserId: string): FileVersion => ({
  id: `00000000-0000-4000-8000-00000000000${number}` as FileVersion["id"],
  fileId: "00000000-0000-4000-8000-0000000000aa" as FileVersion["fileId"],
  number,
  size: number * 10,
  mimeType: "text/plain",
  createdByUserId: createdByUserId as FileVersion["createdByUserId"],
  createdAt: "2026-01-02T03:04:05.000Z",
});

describe("toFileVersionRows", () => {
  it("lists the versions newest first and marks the highest number as current", () => {
    const rows = toFileVersionRows(
      [version(1, "u1"), version(3, "u1"), version(2, "u2")],
      (userId) => (userId === "u1" ? "Anna" : null),
    );

    expect(rows.map((row) => row.number)).toEqual([3, 2, 1]);
    expect(rows.map((row) => row.isCurrent)).toEqual([true, false, false]);
    expect(rows[0]).toMatchObject({ sizeBytes: 30, authorName: "Anna" });
    expect(rows[1]?.authorName).toBeNull();
    expect(rows[0]?.createdAt).toEqual(new Date("2026-01-02T03:04:05.000Z"));
  });

  it("returns no rows when there are no versions", () => {
    expect(toFileVersionRows([], () => null)).toEqual([]);
  });
});
