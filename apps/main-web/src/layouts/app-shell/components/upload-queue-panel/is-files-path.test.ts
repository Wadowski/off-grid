// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isFilesPath } from "./is-files-path.js";

describe("isFilesPath", () => {
  it("matches the Files page and its folders", () => {
    expect(isFilesPath("/files")).toBe(true);
    expect(isFilesPath("/files/drive/abc")).toBe(true);
  });

  it("does not match other pages that start with the same letters", () => {
    expect(isFilesPath("/filesystem")).toBe(false);
    expect(isFilesPath("/notifications")).toBe(false);
  });
});
