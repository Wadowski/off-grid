// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isInlineSafeMediaType } from "./is-inline-safe-media-type.js";

describe("isInlineSafeMediaType", () => {
  it.each(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"])(
    "allows %s to be shown inline",
    (mediaType) => {
      expect(isInlineSafeMediaType(mediaType)).toBe(true);
    },
  );

  it("ignores case and parameters", () => {
    expect(isInlineSafeMediaType("Image/PNG; charset=binary")).toBe(true);
  });

  it.each([
    "image/svg+xml",
    "text/html",
    "application/xhtml+xml",
    "text/xml",
    "application/javascript",
    "text/plain",
    "application/octet-stream",
    "",
  ])("refuses %s to be shown inline", (mediaType) => {
    expect(isInlineSafeMediaType(mediaType)).toBe(false);
  });
});
