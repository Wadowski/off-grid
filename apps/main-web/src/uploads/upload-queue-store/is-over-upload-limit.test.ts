// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isOverUploadLimit } from "./is-over-upload-limit.js";

describe("isOverUploadLimit", () => {
  it("allows a file that is exactly at the limit", () => {
    expect(isOverUploadLimit(1024, 1024)).toBe(false);
  });

  it("rejects a file one byte above the limit", () => {
    expect(isOverUploadLimit(1025, 1024)).toBe(true);
  });

  it("never rejects a file while the limit is unknown", () => {
    expect(isOverUploadLimit(Number.MAX_SAFE_INTEGER, null)).toBe(false);
  });
});
