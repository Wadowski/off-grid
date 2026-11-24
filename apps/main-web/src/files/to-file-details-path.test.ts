// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toFileDetailsPath } from "./to-file-details-path.js";

describe("toFileDetailsPath", () => {
  it("builds the file details path under the drive", () => {
    expect(toFileDetailsPath("drive-1", "file-2")).toBe("/files/drive-1/file/file-2");
  });

  it("encodes the drive and file ids", () => {
    expect(toFileDetailsPath("a/b", "c d")).toBe("/files/a%2Fb/file/c%20d");
  });
});
